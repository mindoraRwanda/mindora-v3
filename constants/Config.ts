// Single backend base URL — the Kong gateway in front of every Mindora service.
export const KONG_BASE_URL = 'https://api.mindora.rw';

export const API_BASE_URL = `${KONG_BASE_URL}/api/v1`;

// The messaging-service's Socket.io server, reached through the same gateway.
export const SOCKET_URL = KONG_BASE_URL;
export const SOCKET_PATH = '/api/v1/messaging/socket.io';
