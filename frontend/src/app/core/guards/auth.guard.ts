import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.ensureCurrentUser().pipe(
      map((user) => {
        if (user) {
          return true;
        }
        return this.router.parseUrl('/login');
      }),
      catchError(() => {
        return of(this.router.parseUrl('/login'));
      })
    );
  }
}
