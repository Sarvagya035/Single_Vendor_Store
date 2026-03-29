import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { SKIP_GLOBAL_ERROR_NOTIFICATION } from './request-flags';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const isAuthBootstrapRequest =
          request.url.includes('/users/current-user') || request.url.includes('/users/refreshToken');
        const skipGlobalNotification = request.context.get(SKIP_GLOBAL_ERROR_NOTIFICATION);
        const shouldIgnoreRedirect = isAuthBootstrapRequest;
        const friendlyMessage = isAuthBootstrapRequest || skipGlobalNotification ? '' : this.getFriendlyMessage(error);

        if (error.status === 401 && !shouldIgnoreRedirect && !skipGlobalNotification) {
          this.notificationService.info('Your session expired. Please sign in again.', 'Session expired');
          this.router.navigate(['/login']);
        } else if (friendlyMessage) {
          this.notificationService.error(friendlyMessage);
        }
        return throwError(() => error);
      })
    );
  }

  private getFriendlyMessage(error: HttpErrorResponse): string {
    const backendMessage = typeof error.error?.message === 'string' ? error.error.message.trim() : '';

    if (backendMessage) {
      const cleaned = this.cleanBackendMessage(backendMessage, error);
      if (cleaned) {
        return cleaned;
      }
    }

    if (error.status === 0) {
      return 'We could not reach the server. Please check your connection and try again.';
    }

    if (error.status === 400) {
      return 'Please check the form and try again.';
    }

    if (error.status === 403) {
      return 'You do not have permission to do that.';
    }

    if (error.status >= 500) {
      return 'Something went wrong on our side. Please try again in a moment.';
    }

    return backendMessage || 'Something went wrong. Please try again.';
  }

  private cleanBackendMessage(message: string, error: HttpErrorResponse): string {
    if (/E11000 duplicate key error/i.test(message)) {
      const duplicateField = this.extractDuplicateField(message) || this.extractDuplicateFieldFromBody(error);
      if (duplicateField === 'phone') {
        return 'This phone number is already registered. Please use a different number.';
      }

      if (duplicateField === 'email') {
        return 'This email address is already registered. Please sign in or use another email.';
      }

      return 'This value is already in use. Please choose another one.';
    }

    return message;
  }

  private extractDuplicateField(message: string): string {
    const fieldMatch = message.match(/index:\s*([A-Za-z0-9_]+)_1/i);
    return fieldMatch?.[1]?.toLowerCase() || '';
  }

  private extractDuplicateFieldFromBody(error: HttpErrorResponse): string {
    const keyValue = error.error?.keyValue;
    if (!keyValue || typeof keyValue !== 'object') {
      return '';
    }

    const [fieldName] = Object.keys(keyValue);
    return String(fieldName || '').toLowerCase();
  }
}
