import { API_BASE_URL } from '@/constants/Config';

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Core request function.
 * - Automatically sets Content-Type and Authorization headers.
 * - Throws a structured error with a human-readable message on failure.
 * - Handles network errors (no connection) separately from API errors.
 */
async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch (networkError: any) {
    // Network-level error (no connection, DNS failure, etc.)
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  // Try to parse JSON — guard against empty bodies (e.g. 204 No Content)
  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.message || `Server error (${response.status}). Please try again.`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'GET', token }),

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

  patch: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (credentials: { email: string; password: string }) => {
  return api.post('/auth/login', credentials);
};

export const register = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  return api.post('/auth/register', userData);
};

export const refreshToken = async (token: string) => {
  return api.post('/auth/refresh-token', { refreshToken: token });
};

export const forgotPassword = async (email: string) => {
  return api.post('/auth/forgot-password', { email });
};

// ─── User ────────────────────────────────────────────────────────────────────

export const getProfile = async (token: string) => {
  return api.get('/users/profile', token);
};

export const updateProfile = async (token: string, data: any) => {
  return api.put('/users/profile', data, token);
};

// ─── Public Resources ────────────────────────────────────────────────────────

export const getPublicResources = async () => {
  return api.get('/resources');
};

export const getEmergencyContacts = async () => {
  return api.get('/emergency-contacts');
};

// ─── Therapists ──────────────────────────────────────────────────────────────

export const getTherapists = async (token: string) => {
  return api.get('/therapists', token);
};

export const getTherapistById = async (therapistId: string, token?: string) => {
  return api.get(`/therapists/${therapistId}`, token);
};

// ─── Appointments ────────────────────────────────────────────────────────────

export const getAppointments = async (token: string) => {
  return api.get('/appointments', token);
};

export const bookAppointment = async (token: string, data: any) => {
  return api.post('/appointments', data, token);
};

export const cancelAppointment = async (token: string, appointmentId: string) => {
  return api.put(`/appointments/${appointmentId}/cancel`, {}, token);
};

// ─── Mood Tracking ───────────────────────────────────────────────────────────

export const getMoodLogs = async (token: string) => {
  return api.get('/mood-logs', token);
};

export const logMood = async (token: string, data: { level: string; notes?: string }) => {
  return api.post('/mood-logs', data, token);
};

export const getMoodAnalytics = async (token: string) => {
  return api.get('/mood-logs/analytics', token);
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async (token: string) => {
  return api.get('/notifications', token);
};

export const markNotificationRead = async (token: string, notificationId: string) => {
  return api.patch(`/notifications/${notificationId}/read`, {}, token);
};
