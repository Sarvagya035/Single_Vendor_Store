import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorDetail, ApiErrorResponse } from '../models/api-response.model';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastKind;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private readonly toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  readonly toast$ = this.toastSubject.asObservable();

  showToast(message: string, type: ToastKind = 'error'): void {
    this.toastSubject.next({
      id: Date.now(),
      message,
      type
    });
  }

  clearToast(): void {
    this.toastSubject.next(null);
  }

  handleHttpError(error: HttpErrorResponse): string {
    const message = this.extractErrorMessage(error);
    this.showToast(message, 'error');
    return message;
  }

  extractErrorMessage(error: unknown): string {
    if (!error) {
      return 'Something went wrong. Please try again.';
    }

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Network error. Please check your internet connection.';
      }

      const backendError = error.error as ApiErrorResponse | string | null;

      if (backendError && typeof backendError === 'object') {
        const structuredMessage = this.extractStructuredMessage(backendError);
        if (structuredMessage) {
          return structuredMessage;
        }
      }

      if (typeof backendError === 'string' && backendError.trim()) {
        return backendError;
      }

      return error.message || 'Request failed. Please try again.';
    }

    if (error instanceof Error) {
      return error.message || 'Unexpected error occurred.';
    }

    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    return 'Something went wrong. Please try again.';
  }

  private extractStructuredMessage(error: ApiErrorResponse): string | null {
    const errors = error.errors;

    if (Array.isArray(errors)) {
      const firstError = errors.find((item) => {
        if (typeof item === 'string') {
          return item.trim().length > 0;
        }

        return Boolean((item as ApiErrorDetail)?.message);
      });

      if (typeof firstError === 'string') {
        return firstError;
      }

      if (firstError && typeof firstError === 'object' && 'message' in firstError) {
        return (firstError as ApiErrorDetail).message;
      }
    }

    if (typeof errors === 'object') {
      const values = Object.values(errors).flat().filter(Boolean);
      if (values.length > 0) {
        return String(values[0]);
      }
    }

    if (error.success === false && error.message) {
      return error.message;
    }

    return error.message || null;
  }
}
