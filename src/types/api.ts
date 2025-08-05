// General API Response Types
export interface StatusDetail {
  code: { code: string; message: string };
  message: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface GeneralResponse<T> {
  status: StatusDetail;
  data: T | null;
  message: string;
  timestamp: string;
  pagination?: Pagination;
  errors?: ErrorDetail[];
}

// Dashboard Types
export interface DashboardResponse {
  welcomeMessage: string;
  plan: string;
  documents: DocumentsDashboard;
  totalDocuments: number;
  notifications: {
    unread: number;
  };
}

export interface DocumentsDashboard {
  completed: number;
  rejected: number;
  "in_progress": number;
  draft: number;
  pending: number;
  recycler: number;
}

// Profile Types
export interface ProfileResponse {
  _id: string;
  name: string;
  surname: string;
  email: string;
  language: string;
  photo: string | null;
  roles: string[];
  isActive: boolean;
  profileImageUrl: string | null;
  firtLogin: boolean;
  twoFactorAuthEnabled: boolean;
  __s: string;
  temporaryPassword: string | null;
  temporaryPasswordExpiresAt: string | null;
  acceptedTerms: AcceptedTerms[];
}

export interface AcceptedTerms {
  type: string;
  termId: string;
  _id: string;
}

export interface TwofaVerifyResponse {
  secret: string;
  qrCodeURI: string;
}

// Contact Types
export interface ContactResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  countryCode?: string;
  company?: string;
  isActive?: boolean;
  position?: string;
  address?: ContactAddress;
}

export interface ContactRequest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  countryCode?: string;
  role?: string;
  language?: string;
  address: ContactAddress;
}

export interface ContactAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Notification Types
export interface NotificationsRequest {
  title: string;
  data: {
    message: string;
    title: string;
    metadata?: Record<string, any>;
  };
  read: boolean;
  status: "unread" | "read";
}

export interface NotificationUI {
  id: string;
  data: {
    title: string;
    message: string;
    metadata?: Record<string, any>;
  };
  read: boolean;
  status: "unread" | "read";
  timeAgo: string;
}

export interface NotificationUnread {
  unreadCount: number;
}

// Document Types
export interface DocumentSignatureResponse {
  success: boolean;
  message: string;
}

export interface signatureParams {
  documentId: string;
  signerId: string;
  signId: string;
  signature: string;
  signatureType: "image" | "text";
  signatureText?: string;
  signatureFontFamily?: string;
}

// Term Types
export interface AcceptTermRequest {
  userId: string;
  termId: string;
  accepted: boolean;
}