import apiClient from './client';

export interface LoginInput { email: string; password: string }
export interface SignupInput { name: string; email: string; password: string }
export interface AuthTokens { access: string; refresh: string }
export interface AuthUser { id: number; name: string; email: string; date_joined: string }

export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<AuthTokens>('/auth/login/', data).then((r) => r.data),

  signup: (data: SignupInput) =>
    apiClient.post<AuthTokens>('/auth/signup/', data).then((r) => r.data),

  me: () =>
    apiClient.get<AuthUser>('/auth/me/').then((r) => r.data),

  updateMe: (data: Partial<Pick<AuthUser, 'name'>>) =>
    apiClient.patch<AuthUser>('/auth/me/', data).then((r) => r.data),

  logout: (refresh: string) =>
    apiClient.post('/auth/logout/', { refresh }),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password/', { email }),
};
