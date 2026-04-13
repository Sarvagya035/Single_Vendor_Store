import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  context?: HttpContext;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.get<T>(url, {
      ...options,
      withCredentials: options.withCredentials ?? true
    });
  }

  post<T>(url: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.post<T>(url, body, {
      ...options,
      withCredentials: options.withCredentials ?? true
    });
  }

  put<T>(url: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.put<T>(url, body, {
      ...options,
      withCredentials: options.withCredentials ?? true
    });
  }

  patch<T>(url: string, body: unknown, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.patch<T>(url, body, {
      ...options,
      withCredentials: options.withCredentials ?? true
    });
  }

  delete<T>(url: string, options: ApiRequestOptions = {}): Observable<T> {
    return this.http.delete<T>(url, {
      ...options,
      withCredentials: options.withCredentials ?? true
    });
  }
}
