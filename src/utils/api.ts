import axios, { AxiosError, AxiosResponse } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request logging or auth headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin';
          }
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`HTTP ${status}: ${(data as any)?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received');
    } else {
      // Other error
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Helper function to make API calls with better error handling
export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  params?: any
): Promise<T> => {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};

// Specific API functions
export const apiGet = <T>(url: string, params?: any): Promise<T> => 
  apiCall<T>('GET', url, undefined, params);

export const apiPost = <T>(url: string, data?: any): Promise<T> => 
  apiCall<T>('POST', url, data);

export const apiPut = <T>(url: string, data?: any): Promise<T> => 
  apiCall<T>('PUT', url, data);

export const apiDelete = <T>(url: string): Promise<T> => 
  apiCall<T>('DELETE', url);

export default api; 