import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private api: ApiService) { }

  updateProfile(data: any): Observable<any> {
    return this.api.patch(`${this.apiUrl}/update-user`, data);
  }

  updateAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.api.patch(`${this.apiUrl}/update-avatar`, formData);
  }

  changePassword(data: any): Observable<any> {
    return this.api.post(`${this.apiUrl}/changePassword`, data);
  }
}
