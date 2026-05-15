import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  BulkInquiryListResponse,
  BulkInquiryRecord,
  BulkInquiryStatus,
  BulkInquiryStatusUpdatePayload,
  BulkInquiryStatusUpdateResult
} from '../models/bulk-inquiry.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminBulkInquiryService {
  private readonly adminUrl = `${environment.apiUrl}/admin/bulk-inquiries`;

  constructor(private readonly api: ApiService) {}

  getBulkInquiries(): Observable<ApiResponse<BulkInquiryListResponse>> {
    return this.api.get<ApiResponse<BulkInquiryListResponse>>(this.adminUrl);
  }

  getBulkInquiryById(id: string): Observable<ApiResponse<BulkInquiryRecord>> {
    return this.api.get<ApiResponse<BulkInquiryRecord>>(`${this.adminUrl}/${id}`);
  }

  updateBulkInquiryStatus(id: string, payload: BulkInquiryStatusUpdatePayload): Observable<ApiResponse<BulkInquiryStatusUpdateResult>> {
    return this.api.patch<ApiResponse<BulkInquiryStatusUpdateResult>>(`${this.adminUrl}/${id}/status`, payload);
  }
}
