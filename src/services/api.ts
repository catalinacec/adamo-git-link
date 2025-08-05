import { apiClient, authClient } from '@/lib/axios';
import type {
  GeneralResponse,
  DashboardResponse,
  ProfileResponse,
  ContactResponse,
  ContactRequest,
  NotificationsRequest,
  NotificationUnread,
  DocumentSignatureResponse,
  signatureParams,
  AcceptTermRequest,
} from '@/types/api';

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/login', { email, password });
    return response.data;
  },

  register: async (userData: any): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/register', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (userId: string, code: string): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/verify-otp', { userId, code });
    return response.data;
  },

  changePassword: async (userId: string, newPassword: string): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/change-password', { userId, newPassword });
    return response.data;
  },

  acceptTerms: async (data: Omit<AcceptTermRequest, "userId">): Promise<GeneralResponse<undefined>> => {
    const response = await authClient.post('/v1/accept-terms', data);
    return response.data;
  },

  refreshToken: async (): Promise<GeneralResponse<any>> => {
    const response = await authClient.post('/v1/refresh-token');
    return response.data;
  },
};

// Dashboard Service
export const dashboardService = {
  getDashboardInfo: async (): Promise<GeneralResponse<DashboardResponse>> => {
    const response = await apiClient.get('/v1/dashboard/welcome-stats');
    return response.data;
  },
};

// Profile Service
export const profileService = {
  getProfile: async (): Promise<GeneralResponse<ProfileResponse>> => {
    const response = await apiClient.get('/v1/users/profile');
    return response.data;
  },

  updateProfile: async (data: FormData): Promise<GeneralResponse<ProfileResponse>> => {
    const response = await apiClient.put('/v1/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  enable2FA: async (): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/users/enable-2fa');
    return response.data;
  },

  verify2FA: async (token: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/users/verify-2fa', { token });
    return response.data;
  },

  disable2FA: async (): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/users/disable-2fa');
    return response.data;
  },
};

// Contact Service
export const contactService = {
  getContacts: async (): Promise<GeneralResponse<ContactResponse[]>> => {
    const response = await apiClient.get('/v1/contacts');
    return response.data;
  },

  createContact: async (data: ContactRequest): Promise<GeneralResponse<ContactResponse>> => {
    const response = await apiClient.post('/v1/contacts', data);
    return response.data;
  },

  updateContact: async (id: string, data: ContactRequest): Promise<GeneralResponse<ContactResponse>> => {
    const response = await apiClient.put(`/v1/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.delete(`/v1/contacts/${id}`);
    return response.data;
  },

  bulkDeleteContacts: async (ids: string[]): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/contacts/bulk-delete', { ids });
    return response.data;
  },
};

// Notification Service
export const notificationService = {
  getNotifications: async (): Promise<GeneralResponse<NotificationsRequest[]>> => {
    const response = await apiClient.get('/v1/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<GeneralResponse<NotificationUnread>> => {
    const response = await apiClient.get('/v1/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<GeneralResponse<NotificationUnread>> => {
    const response = await apiClient.patch(`/v1/notifications/${id}/read`);
    return response.data;
  },

  deleteNotification: async (id: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.delete(`/v1/notifications/${id}`);
    return response.data;
  },
};

// Document Service
export const documentService = {
  getDocuments: async (): Promise<GeneralResponse<any[]>> => {
    const response = await apiClient.get('/v1/documents');
    return response.data;
  },

  getDocument: async (id: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.get(`/v1/documents/${id}`);
    return response.data;
  },

  createDocument: async (data: FormData): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateDocument: async (id: string, data: any): Promise<GeneralResponse<any>> => {
    const response = await apiClient.put(`/v1/documents/${id}`, data);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.delete(`/v1/documents/${id}`);
    return response.data;
  },

  signDocument: async (params: signatureParams): Promise<GeneralResponse<DocumentSignatureResponse>> => {
    const response = await apiClient.post('/v1/documents/sign', params);
    return response.data;
  },

  bulkDeleteDocuments: async (ids: string[]): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post('/v1/documents/bulk-delete', { ids });
    return response.data;
  },

  restoreDocument: async (id: string): Promise<GeneralResponse<any>> => {
    const response = await apiClient.post(`/v1/documents/${id}/restore`);
    return response.data;
  },
};