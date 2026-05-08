import axios, {
  type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useAuthStore } from '../stores/auth-store';
import { logger } from '../utils/logger';

const log = logger('api');

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30_000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
});

// Stamp each request so we can correlate with the response in logs.
type StampedConfig = InternalAxiosRequestConfig & { _startedAt?: number; _retry?: boolean };

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const stamped = config as StampedConfig;
  stamped._startedAt = Date.now();
  log.debug(`→ ${config.method?.toUpperCase()} ${config.url}`, config.params);
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  log.info('refreshing access token');
  const refresh = await SecureStore.getItemAsync('refresh_token');
  if (!refresh) {
    log.warn('no refresh token in secure store');
    throw new Error('No refresh token');
  }

  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh/`,
    { refresh },
    { headers: { 'ngrok-skip-browser-warning': 'true' } },
  );

  await SecureStore.setItemAsync('access_token', data.access);
  if (data.refresh) {
    await SecureStore.setItemAsync('refresh_token', data.refresh);
    log.debug('rotated refresh token stored');
  }
  log.info('access token refreshed');
  return data.access;
}

async function bounceToLogin() {
  log.warn('refresh failed — bouncing to login');
  await useAuthStore.getState().logout();
  router.replace('/(auth)/login');
}

apiClient.interceptors.response.use(
  (res: AxiosResponse) => {
    const cfg = res.config as StampedConfig;
    const ms = cfg._startedAt ? Date.now() - cfg._startedAt : -1;
    log.debug(`← ${res.status} ${cfg.method?.toUpperCase()} ${cfg.url} (${ms}ms)`);
    return res;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as StampedConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? '';
    const ms = originalRequest?._startedAt ? Date.now() - originalRequest._startedAt : -1;

    log.warn(`← ${status ?? 'NET'} ${originalRequest?.method?.toUpperCase()} ${url} (${ms}ms)`, {
      data: error.response?.data,
      message: error.message,
    });

    const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login');

    if (
      !originalRequest
      || status !== 401
      || originalRequest._retry
      || isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
      }
      const newAccess = await refreshPromise;

      // axios 1.x stores headers as AxiosHeaders; direct property assignment
      // doesn't always propagate to the internal map once the config has been
      // through dispatchRequest. `.set()` is the supported mutation API.
      if (typeof (originalRequest.headers as any)?.set === 'function') {
        (originalRequest.headers as any).set('Authorization', `Bearer ${newAccess}`);
      } else {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      }
      log.debug(`↻ retrying ${originalRequest.method?.toUpperCase()} ${url}`);
      return apiClient(originalRequest);
    } catch (refreshErr) {
      await bounceToLogin();
      return Promise.reject(refreshErr);
    }
  },
);

export default apiClient;
