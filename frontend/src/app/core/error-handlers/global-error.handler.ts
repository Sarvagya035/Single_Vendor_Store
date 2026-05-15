import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ErrorService } from '../services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    const errorService = this.injector.get(ErrorService);
    errorService.showToast(errorService.extractErrorMessage(error), 'error');

    if (!environment.production) {
      console.error(error);
    }
  }
}
