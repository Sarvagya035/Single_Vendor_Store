import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ApiService } from './api.service';

export interface BulkInquiryPayload {
  fullName: string;
  phone: string;
  email?: string;
  businessName?: string;
  orderType: string;
  productRequirement: string;
  quantity?: string | number;
  city: string;
}

export interface BulkInquiryRecord extends BulkInquiryPayload {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class BulkInquiryService {
  private readonly bulkInquiryUrl = `${environment.apiUrl}/bulk-inquiries`;

  constructor(private readonly api: ApiService) {}

  createBulkInquiry(payload: BulkInquiryPayload): Observable<ApiResponse<BulkInquiryRecord>> {
    return this.api.post<ApiResponse<BulkInquiryRecord>>(this.bulkInquiryUrl, payload);
  }
}
