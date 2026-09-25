// Single backend base URL — the Kong gateway in front of every Mindora service.
// Env-driven (Expo inlines EXPO_PUBLIC_* vars at build time — see
// https://docs.expo.dev/guides/environment-variables/) so a dev or preview
// build can point at a local/staging gateway instead of hardcoded production.
// Falls back to production so a build with no .env configured still works.
export const KONG_BASE_URL =
  process.env.EXPO_PUBLIC_KONG_BASE_URL ?? 'https://api.mindora.rw';

export const API_BASE_URL = `${KONG_BASE_URL}/api/v1`;

// The messaging-service's Socket.io server, reached through the same gateway.
export const SOCKET_URL = KONG_BASE_URL;
export const SOCKET_PATH = '/api/v1/messaging/socket.io';
