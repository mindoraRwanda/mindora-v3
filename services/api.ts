import { API_BASE_URL } from '@/constants/Config';

// ─── Core request plumbing ──────────────────────────────────────────────────
// Every Mindora service returns raw JSON (no {success,data} envelope) and is
// reached through the Kong gateway at API_BASE_URL, e.g. `${API_BASE_URL}/auth/login`.

interface RequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  params?: Record<string, any>
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    if (query) url += `?${query}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      // Lets the refresh-token cookie ride along on same-origin/dev requests.
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (typeof data?.error === 'string' ? data.error : null) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

const api = {
  get: <T>(endpoint: string, token?: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', token }, params),
  post: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined, token }),
  put: <T>(endpoint: string, body?: any, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined, token }),
  delete: <T>(endpoint: string, token?: string) => request<T>(endpoint, { method: 'DELETE', token }),
};

// ─── Shared types ────────────────────────────────────────────────────────────

export type UserRole = 'PATIENT' | 'THERAPIST' | 'ADMIN';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface PatientProfile {
  id: string;
  userId: string;
  userName: string | null;
  bio: string | null;
  timezone: string;
  languagePreference: string;
  notificationPreferences: NotificationPreferences;
}

export interface TherapistProfile extends PatientProfile {
  specialisation: string | null;
  languages: string[];
  isAcceptingPatients: boolean;
}

export type SessionType = 'VIDEO' | 'IN_PERSON' | 'CHAT';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  slotStart: string;
  slotEnd: string;
  sessionType: SessionType;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntry {
  id: string;
  moodScore: number;
  emotions: string[];
  sleepHours: number | null;
  stressLevel: number | null;
  energyLevel: number | null;
  journalNote: string | null;
  triggers: string[];
  createdAt: string;
}

// ─── Auth (auth-service, via Kong /auth) ────────────────────────────────────

export const healthCheck = () => api.get<{ status: string; service: string }>('/auth/health');

export const register = (data: { email: string; password: string; userName: string; role?: UserRole }) =>
  api.post<{ userId: string }>('/auth/register', { ...data, role: data.role || 'PATIENT' });

export const login = (credentials: { email: string; password: string }) =>
  api.post<{ accessToken: string }>('/auth/login', credentials);

export const refreshAccessToken = () => api.post<{ accessToken: string }>('/auth/refresh');

export const logout = (token: string) => api.post<{ message: string }>('/auth/logout', undefined, token);

export const forgotPassword = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email });

export const resetPassword = (data: { token: string; newPassword: string }) =>
  api.post<{ message: string }>('/auth/reset-password', data);

export const getMe = (token: string) => api.get<AuthUser>('/auth/me', token);

// ─── Users (user-service, via Kong /users) ──────────────────────────────────

export const getMyProfile = (token: string) =>
  api.get<{ role: UserRole; profile: PatientProfile | TherapistProfile }>('/users/me', token);

export const updateMyProfile = (
  token: string,
  data: Partial<{ userName: string; bio: string; timezone: string; languagePreference: string }>
) => api.put<{ role: UserRole; profile: PatientProfile | TherapistProfile }>('/users/me', data, token);

export const updateFcmToken = (token: string, fcmToken: string) =>
  api.put<{ message: string }>('/users/me/fcm-token', { fcmToken }, token);

export const updateNotificationPreferences = (token: string, prefs: NotificationPreferences) =>
  api.put<{ notificationPreferences: NotificationPreferences }>('/users/me/notification-preferences', prefs, token);

export const getUserContactPreferences = (token: string, userId: string) =>
  api.get(`/users/${userId}/preferences`, token);

export const getTherapists = (
  token: string,
  params?: { page?: number; limit?: number; specialisation?: string; language?: string }
) =>
  api.get<{ therapists: TherapistProfile[]; total: number; page: number; limit: number }>(
    '/users/therapists',
    token,
    params
  );

// ─── Appointments (appointment-service, via Kong /appointments) ─────────────

export const getTherapistAvailability = (
  token: string,
  therapistId: string,
  params?: { from?: string; to?: string }
) => api.get<{ therapistId: string; slots: { slotStart: string; slotEnd: string }[] }>(
  `/appointments/availability/${therapistId}`,
  token,
  params
);

export const bookAppointment = (
  token: string,
  data: { therapistId: string; slotStart: string; slotEnd: string; sessionType: SessionType }
) => api.post<Appointment>('/appointments', data, token);

export const getMyAppointments = (
  token: string,
  params?: { status?: AppointmentStatus; page?: number; limit?: number }
) => api.get<{ appointments: Appointment[]; total: number; page: number; limit: number }>(
  '/appointments/mine',
  token,
  params
);

export const getTherapistSchedule = (token: string, params?: { date?: string }) =>
  api.get<{ appointments: Appointment[]; total: number; page: number; limit: number }>(
    '/appointments/schedule',
    token,
    params
  );

export const confirmAppointment = (token: string, id: string) =>
  api.put<Appointment>(`/appointments/${id}/confirm`, undefined, token);

export const cancelAppointment = (token: string, id: string, cancellationReason?: string) =>
  api.put<Appointment>(`/appointments/${id}/cancel`, { cancellationReason }, token);

export const completeAppointment = (token: string, id: string) =>
  api.put<Appointment>(`/appointments/${id}/complete`, undefined, token);

export const rateAppointment = (token: string, id: string, rating: number) =>
  api.post<Appointment>(`/appointments/${id}/rate`, { rating }, token);

// ─── Mood tracking (mood-tracking-service, via Kong /mood) ──────────────────

export const logMood = (
  token: string,
  data: {
    moodScore: number;
    emotions?: string[];
    sleepHours?: number;
    stressLevel?: number;
    energyLevel?: number;
    journalNote?: string;
    triggers?: string[];
  }
) => api.post<MoodEntry>('/mood/log', data, token);

export const getMoodHistory = (
  token: string,
  params?: { page?: number; limit?: number; startDate?: string; endDate?: string }
) => api.get<{ entries: MoodEntry[]; total: number; page: number; limit: number }>('/mood/history', token, params);

export const getMoodInsights = (token: string) =>
  api.get<{
    buckets: { bucket: string; avgMood: number; avgSleep: number; avgStress: number; avgEnergy: number }[];
    trend: 'improving' | 'declining' | 'stable';
    cached: boolean;
  }>('/mood/insights', token);

export const getMoodStreak = (token: string) =>
  api.get<{ streak: number; lastCheckedIn: string | null }>('/mood/streak', token);

export const getPatientMoodReport = (token: string, userId: string) =>
  api.get(`/mood/report/${userId}`, token);

// ─── AI Integration (ai-integration-service, via Kong /ai) ──────────────────

export const sendAiChatMessage = (token: string, data: { message: string; sessionId?: string }) =>
  api.post<{ response: string; crisisLevel: number; sessionId: string }>('/ai/chat', data, token);
