import { API_BASE_URL } from '@/constants/Config';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      token,
    }),
  put: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      token,
    }),
  delete: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'DELETE', token }),
};

// Specific API calls
export const getPublicResources = async () => {
  return api.get('/resources');
};

export const getEmergencyContacts = async () => {
  return api.get('/emergency-contacts');
};

// Auth
export const login = async (credentials: any) => {
  return api.post('/auth/login', credentials);
};

export const register = async (userData: any) => {
  return api.post('/auth/register', userData);
};

export const getProfile = async (token: string) => {
  return api.get('/users/profile', token);
};
