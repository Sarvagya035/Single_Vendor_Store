import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay, tap, finalize, catchError, throwError, map } from 'rxjs';
import { HttpContext } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api-response.model';
import { CustomerUser } from '../models/customer.models';
import { SKIP_AUTH_ERROR_HANDLING } from '../interceptors/request-flags';

type AuthResponsePayload = CustomerUser & {
  user?: CustomerUser | null;
};

type AuthActionResponse = ApiResponse<AuthResponsePayload>;

const isCustomerUser = (value: unknown): value is CustomerUser => {
  return !!value && typeof value === 'object';
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private readonly sessionStorageKey = 'auth-session-active';
  private currentUserSubject = new BehaviorSubject<CustomerUser | null>(null);
  private currentUserRequest$: Observable<AuthActionResponse> | null = null;
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) { }

  get currentUserSnapshot(): CustomerUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  register(userData: Record<string, unknown>): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(`${this.apiUrl}/register`, userData, { withCredentials: false });
  }

  login(credentials: Record<string, unknown>): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success) {
          this.currentUserSubject.next(this.extractCurrentUser(res));
          this.setSessionActive(true);
        }
      })
    );
  }

  requestPasswordReset(payload: { email: string }): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(`${this.apiUrl}/forgot-password`, payload, { withCredentials: false });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(`${this.apiUrl}/reset-password`, payload, { withCredentials: false });
  }

  logout(): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap((res) => {
        if (res.success) {
          this.clearCurrentUser();
        }
      })
    );
  }

  getCurrentUser(): Observable<AuthActionResponse> {
    if (this.currentUserSubject.value) {
      return of({
        success: true,
        message: 'Current user fetched successfully',
        data: this.currentUserSubject.value
      });
    }

    if (!this.hasStoredSession()) {
      return of({
        success: false,
        message: 'No active session',
        data: {} as AuthResponsePayload
      });
    }

    if (!this.currentUserRequest$) {
      let request$: Observable<AuthActionResponse>;

      request$ = this.api.get<AuthActionResponse>(`${this.apiUrl}/current-user`, {
        context: new HttpContext().set(SKIP_AUTH_ERROR_HANDLING, true)
      }).pipe(
        tap((res) => {
          const currentUser = this.extractCurrentUser(res);
          if (res.success) {
            this.currentUserSubject.next(currentUser);
            this.setSessionActive(true);
          } else {
            this.clearCurrentUser();
          }
        }),
        catchError((error) => {
          if (error?.status === 401) {
            this.clearCurrentUser();
            return of({
              success: false,
              message: 'Unauthorized',
              data: {} as AuthResponsePayload
            });
          }

          return throwError(() => error);
        }),
        finalize(() => {
          if (this.currentUserRequest$ === request$) {
            this.currentUserRequest$ = null;
          }
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

      this.currentUserRequest$ = request$;
    }

    return this.currentUserRequest$;
  }

  refreshCurrentUser(): Observable<CustomerUser | null> {
    return this.getCurrentUser().pipe(map((response) => this.extractCurrentUser(response)));
  }

  refreshToken(): Observable<AuthActionResponse> {
    return this.api.post<AuthActionResponse>(
      `${this.apiUrl}/refresh-token`,
      {},
      {
        context: new HttpContext().set(SKIP_AUTH_ERROR_HANDLING, true)
      }
    );
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.currentUserRequest$ = null;
    this.setSessionActive(false);
  }

  setCurrentUser(user: unknown): void {
    const currentUser = isCustomerUser(user) ? user : null;
    this.currentUserSubject.next(currentUser);
    if (currentUser) {
      this.setSessionActive(true);
    }
  }

  hasStoredSession(): boolean {
    return this.readSessionFlag();
  }

  ensureCurrentUser(): Observable<CustomerUser | null> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return of(currentUser);
    }

    if (!this.hasStoredSession()) {
      return of(null);
    }

    return this.getCurrentUser().pipe(map((response) => this.extractCurrentUser(response)));
  }

  private extractCurrentUser(response: AuthActionResponse | null | undefined): CustomerUser | null {
    if (!response?.success) {
      return null;
    }

    const data = response?.data;
    if (!data || typeof data !== 'object') {
      return null;
    }

    if ('user' in data) {
      const user = (data as AuthResponsePayload).user;
      return user && typeof user === 'object' ? user : null;
    }

    return data as CustomerUser;
  }

  private setSessionActive(active: boolean): void {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return;
    }

    if (active) {
      window.localStorage.setItem(this.sessionStorageKey, 'true');
      return;
    }

    window.localStorage.removeItem(this.sessionStorageKey);
  }

  private readSessionFlag(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(this.sessionStorageKey) === 'true';
  }
}
