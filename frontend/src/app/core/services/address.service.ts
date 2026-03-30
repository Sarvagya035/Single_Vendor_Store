import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/address`;

  constructor(private http: HttpClient) { }

  getAddresses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-address`, { withCredentials: true });
  }

  addAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-address`, addressData, { withCredentials: true });
  }

  updateAddress(addressId: string, addressData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/update-address/${addressId}`, addressData, { withCredentials: true });
  }

  deleteAddress(addressId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-address/${addressId}`, { withCredentials: true });
  }

  setDefaultAddress(addressId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/set-defaultAddress/${addressId}`, {}, { withCredentials: true });
  }
}
