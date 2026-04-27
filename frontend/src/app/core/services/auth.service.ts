import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, shareReplay, tap, finalize, catchError, throwError } from 'rxjs';
import { HttpContext } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { SKIP_AUTH_ERROR_HANDLING } from '../interceptors/request-flags';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private readonly sessionStorageKey = 'auth-session-active';
  private currentUserSubject = new BehaviorSubject<any>(null);
  private currentUserRequest$: Observable<any> | null = null;
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) { }

  get currentUserSnapshot(): any {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  register(userData: any): Observable<any> {
    return this.api.post(`${this.apiUrl}/register`, userData, { withCredentials: false });
  }

  login(credentials: any): Observable<any> {
    return this.api.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(res.data?.user ?? null);
          this.setSessionActive(true);
        }
      })
    );
  }

  requestPasswordReset(payload: { email: string }): Observable<any> {
    return this.api.post(`${this.apiUrl}/forgot-password`, payload, { withCredentials: false });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<any> {
    return this.api.post(`${this.apiUrl}/reset-password`, payload, { withCredentials: false });
  }

  logout(): Observable<any> {
    return this.api.post(`${this.apiUrl}/logout`, {}).pipe(
      tap((res: any) => {
        if (res.success) {
          this.clearCurrentUser();
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    if (!this.hasStoredSession()) {
      return of(null);
    }

    if (!this.currentUserRequest$) {
      let request$: Observable<any>;

      request$ = this.api.get(`${this.apiUrl}/current-user`, {
        context: new HttpContext().set(SKIP_AUTH_ERROR_HANDLING, true)
      }).pipe(
        tap((res: any) => {
          if (res.success) {
            this.currentUserSubject.next(res.data);
            this.setSessionActive(true);
          } else {
            this.clearCurrentUser();
          }
        }),
        catchError((error) => {
          if (error?.status === 401) {
            this.clearCurrentUser();
            return of(null);
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

  refreshCurrentUser(): Observable<any> {
    return this.getCurrentUser();
  }

  refreshToken(): Observable<any> {
    return this.api.post(
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
    this.currentUserSubject.next(user);
    if (user) {
      this.setSessionActive(true);
    }
  }

  hasStoredSession(): boolean {
    return this.readSessionFlag();
  }

  ensureCurrentUser(): Observable<any> {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return of(currentUser);
    }

    if (!this.hasStoredSession()) {
      return of(null);
    }

    if (!this.currentUserRequest$) {
      let request$: Observable<any>;

      request$ = this.getCurrentUser().pipe(
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => {
          if (this.currentUserRequest$ === request$) {
            this.currentUserRequest$ = null;
          }
        })
      );

      this.currentUserRequest$ = request$;
    }

    return this.currentUserRequest$;
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
