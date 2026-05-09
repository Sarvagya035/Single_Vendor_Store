import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ErrorService } from './error.service';
import { AppRefreshService } from './app-refresh.service';
import { CustomerUser } from '../models/customer.models';

export type SocketEventName =
  | 'notification:new'
  | 'order:new'
  | 'order:status-updated'
  | 'inquiry:new'
  | 'stock:low'
  | 'realtime:ready';

export interface RealtimeSocketEvent<T = unknown> {
  name: SocketEventName;
  payload: T;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly eventsSubject = new Subject<RealtimeSocketEvent>();
  readonly events$ = this.eventsSubject.asObservable();

  private socket: Socket | null = null;
  private syncSubscription: Subscription | null = null;
  private currentUser: CustomerUser | null = null;
  private accessToken: string | null = null;
  private connectedToken: string | null = null;
  private refreshingToken = false;
  private socketWarningShown = false;
  private readonly processedEventIds = new Set<string>();
  private readonly socketUrl = this.resolveSocketUrl(environment.socketUrl || environment.apiUrl);

  constructor(
    private readonly authService: AuthService,
    private readonly errorService: ErrorService,
    private readonly appRefreshService: AppRefreshService
  ) {
    this.syncSubscription = new Subscription();
    this.syncSubscription.add(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        this.syncConnection();
      })
    );
    this.syncSubscription.add(
      this.authService.accessToken$.subscribe((token) => {
        this.accessToken = token;
        this.syncConnection();
      })
    );
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connectedToken = null;
    this.socketWarningShown = false;
  }

  private syncConnection(): void {
    if (!this.currentUser) {
      this.disconnect();
      return;
    }

    if (!this.accessToken) {
      if (this.authService.hasStoredSession() && !this.refreshingToken) {
        this.refreshingToken = true;
        this.authService.refreshToken().subscribe({
          next: () => {
            this.refreshingToken = false;
          },
          error: () => {
            this.refreshingToken = false;
            this.disconnect();
          }
        });
      }
      return;
    }

    if (this.socket?.connected && this.connectedToken === this.accessToken) {
      return;
    }

    this.connect(this.accessToken);
  }

  private connect(token: string): void {
    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(this.socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: false,
      auth: {
        token
      }
    });
    this.connectedToken = token;

    this.socket.on('connect_error', (error) => {
      const message = error?.message || 'Unable to connect to realtime updates.';
      if (/unauthorized|authentication token/i.test(message.toLowerCase())) {
        if (this.authService.hasStoredSession() && !this.refreshingToken) {
          this.accessToken = null;
          this.refreshingToken = true;
          this.authService.refreshToken().subscribe({
            next: () => {
              this.refreshingToken = false;
            },
            error: () => {
              this.refreshingToken = false;
              this.disconnect();
            }
          });
        }
        return;
      }

      if (!this.socketWarningShown) {
        this.socketWarningShown = true;
        this.errorService.showToast('Realtime updates are currently unavailable. The app will keep working normally.', 'warning');
      }

      this.socket?.disconnect();
    });

    this.registerSocketHandlers(this.socket);
  }

  private registerSocketHandlers(socket: Socket): void {
    const handledEvents: SocketEventName[] = [
      'notification:new',
      'order:new',
      'order:status-updated',
      'inquiry:new',
      'stock:low',
      'realtime:ready'
    ];

    for (const eventName of handledEvents) {
      socket.on(eventName, (payload) => this.handleEvent(eventName, payload));
    }
  }

  private handleEvent<T = unknown>(name: SocketEventName, payload: T): void {
    const eventId = this.extractEventId(payload);
    if (eventId && this.processedEventIds.has(eventId)) {
      return;
    }

    if (eventId) {
      this.processedEventIds.add(eventId);
      if (this.processedEventIds.size > 200) {
        this.processedEventIds.clear();
      }
    }

    this.eventsSubject.next({ name, payload });

    if (name === 'realtime:ready') {
      return;
    }

    this.showToastForEvent(name, payload);
    this.requestRefreshForEvent(name);
  }

  private showToastForEvent(name: SocketEventName, payload: unknown): void {
    const record = payload as Record<string, unknown> | null;
    const title = typeof record?.['title'] === 'string' ? record['title'] : '';
    const message = typeof record?.['message'] === 'string' ? record['message'] : '';
    const orderNumber = typeof record?.['orderNumber'] === 'string' ? record['orderNumber'] : '';

    switch (name) {
      case 'stock:low':
        this.errorService.showToast(message || title || 'Low stock alert received.', 'warning');
        return;
      case 'inquiry:new':
        this.errorService.showToast(message || title || 'New inquiry received.', 'info');
        return;
      case 'order:new':
        this.errorService.showToast(
          message || (orderNumber ? `Order #${orderNumber} received.` : 'New order received.'),
          'success'
        );
        return;
      case 'order:status-updated':
        this.errorService.showToast(message || 'Order status updated.', 'info');
        return;
      case 'notification:new':
        this.errorService.showToast(message || title || 'New notification received.', 'info');
        return;
      default:
        return;
    }
  }

  private requestRefreshForEvent(name: SocketEventName): void {
    switch (name) {
      case 'notification:new':
      case 'stock:low':
      case 'inquiry:new':
      case 'order:new':
        this.appRefreshService.notify('vendor');
        return;
      case 'order:status-updated':
        this.appRefreshService.notify('customer');
        this.appRefreshService.notify('vendor');
        return;
      default:
        return;
    }
  }

  private extractEventId(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;
    const eventId = record['eventId'];
    return typeof eventId === 'string' && eventId.trim() ? eventId : null;
  }

  private resolveSocketUrl(apiUrl: string): string {
    try {
      return new URL(apiUrl).origin;
    } catch {
      const normalized = apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
      return normalized || 'http://localhost:5000';
    }
  }
}
