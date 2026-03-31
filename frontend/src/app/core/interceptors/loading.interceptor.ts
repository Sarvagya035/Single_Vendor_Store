import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const skipLoading = request.headers.has('X-Skip-Loading');

    if (!skipLoading) {
      this.loadingService.start();
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (!skipLoading) {
          this.loadingService.stop();
        }
      })
    );
  }
}
