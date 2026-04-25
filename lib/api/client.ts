import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refresh_token');
        if (!refresh) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
          { refresh },
        );
        await SecureStore.setItemAsync('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return apiClient(originalRequest);
      } catch {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // auth store logout is handled in RootLayout via SecureStore listener
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
