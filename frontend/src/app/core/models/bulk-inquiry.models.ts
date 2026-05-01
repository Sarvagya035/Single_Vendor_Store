export type BulkInquiryStatus = 'new' | 'reviewed' | 'contacted' | 'closed';

export interface BulkInquiryRecord {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  businessName?: string;
  orderType: string;
  productRequirement: string;
  quantity?: string | number;
  city: string;
  status: BulkInquiryStatus;
  vendorResponseMessage?: string;
  lastRespondedBy?: string;
  lastRespondedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkInquirySummary {
  totalInquiries: number;
  newCount: number;
  reviewedCount: number;
  contactedCount: number;
  closedCount: number;
}

export interface BulkInquiryListResponse {
  inquiries: BulkInquiryRecord[];
  summary: BulkInquirySummary;
}

export interface BulkInquiryStatusUpdateResult {
  inquiry: BulkInquiryRecord;
  emailSent: boolean;
  emailWarning?: string | null;
}

export interface BulkInquiryStatusUpdatePayload {
  status: BulkInquiryStatus;
  message?: string;
}
