import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authService: any;
  let router: any;

  beforeEach(() => {
    authService = {
      getCurrentUser: vi.fn()
    };
    router = {
      parseUrl: vi.fn((url: string) => ({ toString: () => url } as UrlTree))
    };

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    guard = TestBed.inject(RoleGuard);
  });

  function routeWithRoles(roles: string[]): ActivatedRouteSnapshot {
    return { data: { roles } } as unknown as ActivatedRouteSnapshot;
  }

  it('allows navigation when a user has a matching role in an array', async () => {
    authService.getCurrentUser.mockReturnValue(of({ success: true, data: { role: ['admin'] } }));

    await expect(firstValueFrom(guard.canActivate(routeWithRoles(['admin', 'Admin'])) as any)).resolves.toBe(true);
  });

  it('allows navigation when a user role comes back as a single string', async () => {
    authService.getCurrentUser.mockReturnValue(of({ success: true, data: { role: 'admin' } }));

    await expect(firstValueFrom(guard.canActivate(routeWithRoles(['admin', 'Admin'])) as any)).resolves.toBe(true);
  });

  it('redirects to home when the user lacks the required role', async () => {
    authService.getCurrentUser.mockReturnValue(of({ success: true, data: { role: ['customer'] } }));

    const result: any = await firstValueFrom(guard.canActivate(routeWithRoles(['admin'])) as any);
    expect(result.toString()).toBe('/');
  });

  it('redirects to login when the auth request fails', async () => {
    authService.getCurrentUser.mockReturnValue(throwError(() => new Error('unauthorized')));

    const result: any = await firstValueFrom(guard.canActivate(routeWithRoles(['admin'])) as any);
    expect(result.toString()).toBe('/login');
  });
});
