import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(res.data?.user ?? null);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap((res: any) => {
        if (res.success) {
          this.currentUserSubject.next(null);
        }
      })
    );
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current-user`, { withCredentials: true }).pipe(
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
    return this.http.post(`${this.apiUrl}/refreshToken`, {}, { withCredentials: true });
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}
