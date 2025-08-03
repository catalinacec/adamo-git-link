// Mock API service - replace with actual GitHub API service
export const apiService = {
  get: async <T>(url: string, signal?: AbortSignal): Promise<T> => {
    // Mock response for development
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (url.includes('/dashboard/welcome-stats')) {
      return {
        status: { code: { code: 'success', message: 'Success' }, message: 'Success' },
        data: {
          welcomeMessage: "¡Hola, María Laura!",
          plan: "Plan Básico",
          documents: {
            completed: 13411,
            rejected: 671,
            in_progress: 2510,
            draft: 0,
            pending: 0,
            recycler: 0
          },
          totalDocuments: 381,
          notifications: {
            unread: 3
          }
        },
        message: "Success",
        timestamp: new Date().toISOString()
      } as T;
    }
    
    return {} as T;
  },

  post: async <T>(url: string, data: any, signal?: AbortSignal): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {} as T;
  },

  delete: async <T>(url: string, signal?: AbortSignal): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {} as T;
  },

  postFormData: async (url: string, formData: FormData, signal?: AbortSignal): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {};
  },
};

export default apiService;