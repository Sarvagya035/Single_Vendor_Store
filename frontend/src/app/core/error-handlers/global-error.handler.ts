import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorService } from '../services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    const errorService = this.injector.get(ErrorService);
    errorService.showToast(errorService.extractErrorMessage(error), 'error');

    if (error instanceof Error) {
      console.error(error);
    } else {
      console.error('Unhandled application error', error);
    }
  }
}
