import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const requiredRoles = route.data['roles'] as Array<string>;

    return this.authService.getCurrentUser().pipe(
      map(response => {
        if (response.success && response.data) {
          const userRoles = this.normalizeRoles(response.data.role);
          const hasRole = userRoles.some((role: string) => requiredRoles.includes(role));
          if (hasRole) {
            return true;
          }
          return this.router.parseUrl('/'); 
        }
        return this.router.parseUrl('/login');
      }),
      catchError(() => {
        return of(this.router.parseUrl('/login'));
      })
    );
  }

  private normalizeRoles(role: unknown): string[] {
    if (Array.isArray(role)) {
      return role.map((value) => String(value));
    }

    if (typeof role === 'string' && role.trim()) {
      return [role];
    }

    return [];
  }
}
