import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService) { }

  register(userData: any): Observable<any> {
    return this.api.post(`${this.apiUrl}/register`, userData, { withCredentials: false });
  }

  login(credentials: any): Observable<any> {
    return this.api.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(res.data?.user ?? null);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.api.post(`${this.apiUrl}/logout`, {}).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.api.get(`${this.apiUrl}/current-user`).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(res.data);
        } else {
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  refreshCurrentUser(): Observable<any> {
    return this.getCurrentUser();
  }

  refreshToken(): Observable<any> {
    return this.api.post(`${this.apiUrl}/refreshToken`, {});
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
