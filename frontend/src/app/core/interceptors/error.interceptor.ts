import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';
import { SKIP_AUTH_ERROR_HANDLING } from './request-flags';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private errorService: ErrorService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const isCurrentUserRequest = request.url.includes('/users/current-user');
        const shouldSkipAuthErrorHandling =
          request.context.get(SKIP_AUTH_ERROR_HANDLING) ||
          isCurrentUserRequest ||
          request.url.includes('/users/refresh-token') ||
          request.url.includes('/users/changePassword');

        if (!shouldSkipAuthErrorHandling) {
          const message = this.errorService.extractErrorMessage(error);
          const friendlyMessage =
            error.status === 401
              ? 'Your session has expired. Please sign in again.'
              : error.status === 403
                ? 'You do not have permission to perform this action.'
                : message;

          this.errorService.showToast(friendlyMessage || 'Something went wrong. Please try again.', 'error');
        }

        if (error.status === 401 && !shouldSkipAuthErrorHandling) {
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
