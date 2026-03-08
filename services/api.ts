import { API_BASE_URL } from '@/constants/Config';

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Core request function.
 */
async function request<T>(
  endpoint: string, 
  options: RequestOptions = {}, 
  params?: Record<string, any>
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construct URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    if (query) {
      url += (url.includes('?') ? '&' : '?') + query;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (networkError: any) {
    throw new Error(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }

  if (!response.ok) {
    if (response.status === 401 && data?.message === 'No token provided') {
      // Gracefully handle "No token provided" for potentially public endpoints
      return { success: false, message: 'Authentication required' } as unknown as T;
    }
    const message = data?.message || `Server error (${response.status}). Please try again.`;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, token?: string, params?: Record<string, any>) =>
    request<T>(endpoint, { method: 'GET', token }, params),

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

// ─── General ─────────────────────────────────────────────────────────────────

export const healthCheck = () => api.get('/health');

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (credentials: { email: string; password: string }) => {
  return api.post('/auth/login', credentials);
};

export const register = async (userData: {
  fullName: string;
  email: string;
  password: string;
  role?: 'PATIENT' | 'THERAPIST' | 'ADMIN';
}) => {
  return api.post('/auth/register', {
    ...userData,
    role: userData.role || 'PATIENT',
  });
};

export const refreshToken = async (token: string) => {
  return api.post('/auth/refresh-token', { refreshToken: token });
};

export const logout = async (token: string, refreshTokenStr: string) => {
  return api.post('/auth/logout', { refreshToken: refreshTokenStr }, token);
};

export const forgotPassword = async (email: string) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (data: { token: string; password: string }) => {
  return api.post('/auth/reset-password', data);
};

export const verifyEmail = async (token: string) => {
  return api.post('/auth/verify-email', { token });
};

export const changePassword = async (token: string, data: any) => {
  return api.post('/auth/change-password', data, token);
};

// ─── User ────────────────────────────────────────────────────────────────────

export const getProfile = async (token: string) => {
  return api.get('/users/profile', token);
};

export const updateProfile = async (token: string, data: any) => {
  return api.patch('/users/profile', data, token);
};

export const uploadAvatar = async (token: string, formData: FormData) => {
  return request('/users/profile/avatar', {
    method: 'POST',
    body: formData,
    token,
  });
};

export const deleteAvatar = async (token: string) => {
  return api.delete('/users/profile/avatar', token);
};

export const getUserById = async (userId: string, token: string) => {
  return api.get(`/users/${userId}`, token);
};

export const getUserStatistics = async (token: string) => {
  return api.get('/users/statistics', token);
};

export const getUserDashboard = async (token: string) => {
  return api.get('/users/dashboard', token);
};

export const getUserAchievements = async (token: string) => {
  return api.get('/users/achievements', token);
};

export const getUserStreaks = async (token: string) => {
  return api.get('/users/streaks', token);
};

// ─── Public Resources ────────────────────────────────────────────────────────

export const getPublicResources = async (token?: string) => {
  return api.get('/resources', token);
};

// ─── Therapists ──────────────────────────────────────────────────────────────

export const getTherapists = async (token: string) => {
  return api.get('/therapists', token);
};

export const getTherapistById = async (therapistId: string, token?: string) => {
  return api.get(`/therapists/${therapistId}`, token);
};

export const updateTherapistProfile = async (token: string, therapistId: string, data: any) => {
  return api.patch(`/therapists/${therapistId}`, data, token);
};

export const setTherapistAvailability = async (token: string, availabilityData: any) => {
  return api.post('/therapists/availability', availabilityData, token);
};

export const uploadTherapistDocuments = async (token: string, formData: FormData) => {
  return request('/therapists/documents', {
    method: 'POST',
    body: formData,
    token,
  });
};

export const getTherapistAnalytics = async (token: string) => {
  return api.get('/therapists/analytics', token);
};

// ─── Appointments ────────────────────────────────────────────────────────────

export const getAppointments = async (token: string) => {
  return api.get('/appointments', token);
};

export const getAppointmentById = async (token: string, appointmentId: string) => {
  return api.get(`/appointments/${appointmentId}`, token);
};

export const bookAppointment = async (token: string, data: any) => {
  return api.post('/appointments', data, token);
};

export const cancelAppointment = async (token: string, appointmentId: string, reason?: string) => {
  return api.patch(`/appointments/${appointmentId}/cancel`, { reason }, token);
};

export const confirmAppointment = async (token: string, appointmentId: string) => {
  return api.patch(`/appointments/${appointmentId}/confirm`, {}, token);
};

export const completeAppointment = async (token: string, appointmentId: string) => {
  return api.patch(`/appointments/${appointmentId}/complete`, {}, token);
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

// ─── Exercises ───────────────────────────────────────────────────────────────

export const getExercises = async (token: string) => {
  return api.get('/exercises', token);
};

export const getExerciseById = async (token: string, exerciseId: string) => {
  return api.get(`/exercises/${exerciseId}`, token);
};

export const getUserExercises = async (token: string) => {
  return api.get('/exercises/user-exercises', token);
};

export const startExercise = async (token: string, exerciseId: string) => {
  return api.post(`/exercises/user-exercises/${exerciseId}/start`, {}, token);
};

export const updateExerciseProgress = async (token: string, userExerciseId: string, progress: number) => {
  return api.put(`/exercises/user-exercises/${userExerciseId}/progress`, { progress }, token);
};

export const completeExercise = async (token: string, userExerciseId: string) => {
  return api.put(`/exercises/user-exercises/${userExerciseId}/complete`, {}, token);
};

// ─── Community (Posts & Comments) ────────────────────────────────────────────

export const getPosts = async (token: string) => {
  return api.get('/posts', token);
};

export const getPostById = async (token: string, postId: string) => {
  return api.get(`/posts/${postId}`, token);
};

export const createPost = async (token: string, data: { content: string; isAnonymous?: boolean }) => {
  return api.post('/posts', data, token);
};

export const uploadPostImages = async (token: string, postId: string, formData: FormData) => {
  return request(`/posts/${postId}/images`, {
    method: 'POST',
    body: formData,
    token,
  });
};

export const updatePost = async (token: string, postId: string, data: any) => {
  return api.patch(`/posts/${postId}`, data, token);
};

export const deletePost = async (token: string, postId: string) => {
  return api.delete(`/posts/${postId}`, token);
};

export const likePost = async (token: string, postId: string) => {
  return api.post(`/posts/${postId}/like`, {}, token);
};

export const unlikePost = async (token: string, postId: string) => {
  return api.delete(`/posts/${postId}/like`, token);
};

export const flagPost = async (token: string, postId: string, reason: string) => {
  return api.post(`/posts/${postId}/flag`, { reason }, token);
};

export const getPostComments = async (token: string, postId: string) => {
  return api.get(`/posts/${postId}/comments`, token);
};

export const addComment = async (token: string, postId: string, content: string) => {
  return api.post(`/posts/${postId}/comments`, { content }, token);
};

export const updateComment = async (token: string, commentId: string, content: string) => {
  return api.patch(`/comments/${commentId}`, { content }, token);
};

export const deleteComment = async (token: string, commentId: string) => {
  return api.delete(`/comments/${commentId}`, token);
};

export const likeComment = async (token: string, commentId: string) => {
  return api.post(`/comments/${commentId}/like`, {}, token);
};

export const unlikeComment = async (token: string, commentId: string) => {
  return api.delete(`/comments/${commentId}/like`, token);
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const sendMessage = async (token: string, data: { recipientId: string; content: string }) => {
  return api.post('/messages', data, token);
};

export const getConversations = async (token: string) => {
  return api.get('/messages/conversations', token);
};

export const markMessageRead = async (token: string, messageId: string) => {
  return api.patch(`/messages/${messageId}/read`, {}, token);
};

// ─── Emergency Contacts ──────────────────────────────────────────────────────

export const getEmergencyContacts = async (token?: string) => {
  return api.get('/emergency-contacts', token);
};

export const addEmergencyContact = async (token: string, data: { name: string; phoneNumber: string; relationship: string }) => {
  return api.post('/emergency-contacts', data, token);
};

export const deleteEmergencyContact = async (token: string, id: string) => {
  return api.delete(`/emergency-contacts/${id}`, token);
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const createReview = async (token: string, therapistId: string, data: { rating: number; comment: string }) => {
  return api.post(`/reviews/therapists/${therapistId}/reviews`, data, token);
};

export const getTherapistReviews = async (therapistId: string) => {
  return api.get(`/reviews/therapists/${therapistId}/reviews`);
};

// ─── Monitoring ──────────────────────────────────────────────────────────────

export const getMyMonitoring = async (token: string) => {
  return api.get('/monitoring/me', token);
};

export const createMonitoringEntry = async (token: string, patientId: string, data: { riskLevel: string; notes?: string }) => {
  return api.post(`/monitoring/patients/${patientId}`, data, token);
};

export const getPatientReport = async (token: string, patientId: string) => {
  return api.get(`/monitoring/patients/${patientId}/report`, token);
};

export const getHighRiskPatients = async (token: string) => {
  return api.get('/monitoring/high-risk', token);
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAdminDashboard = async (token: string) => {
  return api.get('/admin/dashboard', token);
};

export const getAdminUsers = async (token: string) => {
  return api.get('/admin/users', token);
};

export const getAdminContentStats = async (token: string) => {
  return api.get('/admin/content', token);
};

export const getAdminReports = async (token: string) => {
  return api.get('/admin/reports', token);
};

export const getAdminSettings = async (token: string) => {
  return api.get('/admin/settings', token);
};

export const approveTherapist = async (token: string, therapistId: string) => {
  return api.patch(`/admin/therapists/${therapistId}/approve`, {}, token);
};

export const moderatePost = async (token: string, postId: string, action: 'APPROVE' | 'REJECT' | 'DELETE') => {
  return api.patch(`/posts/${postId}/moderate`, { action }, token);
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async (token: string) => {
  return api.get('/notifications', token);
};

export const markNotificationRead = async (token: string, notificationId: string) => {
  return api.patch(`/notifications/${notificationId}/read`, {}, token);
};

export const deleteNotification = async (token: string, notificationId: string) => {
  return api.delete(`/notifications/${notificationId}`, token);
};
