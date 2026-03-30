import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
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
        AuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('allows navigation when the current user request succeeds', async () => {
    authService.getCurrentUser.mockReturnValue(of({ success: true, data: { _id: '1' } }));

    await expect(firstValueFrom(guard.canActivate() as any)).resolves.toBe(true);
  });

  it('redirects to /login when the current user request returns unsuccessful', async () => {
    authService.getCurrentUser.mockReturnValue(of({ success: false }));

    const result: any = await firstValueFrom(guard.canActivate() as any);
    expect(result.toString()).toBe('/login');
  });

  it('redirects to /login when the current user request throws', async () => {
    authService.getCurrentUser.mockReturnValue(throwError(() => new Error('unauthorized')));

    const result: any = await firstValueFrom(guard.canActivate() as any);
    expect(result.toString()).toBe('/login');
  });
});
