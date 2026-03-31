import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorService } from '../services/error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private errorService: ErrorService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const shouldIgnoreRedirect =
          request.url.includes('/users/current-user') || request.url.includes('/users/refreshToken');

        this.errorService.handleHttpError(error);

        if (error.status === 401 && !shouldIgnoreRedirect) {
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
