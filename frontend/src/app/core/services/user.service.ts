import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  updateProfile(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update-user`, data, { withCredentials: true });
  }

  updateAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.patch(`${this.apiUrl}/update-avatar`, formData, { withCredentials: true });
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/changePassword`, data, { withCredentials: true });
  }
}
