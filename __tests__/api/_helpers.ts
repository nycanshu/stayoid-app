/**
 * Shared setup for API contract tests.
 *
 * Each test file should:
 *   import { loadApi, BASE_HOST, BASE_PATH, resetApiTest } from './_helpers';
 *   beforeEach(() => resetApiTest());
 *   afterAll(() => nock.enableNetConnect());
 *
 * `loadApi(name)` returns the named module from `lib/api/`, freshly required
 * after `jest.resetModules()` so each test gets a clean axios instance with
 * its interceptors freshly registered.
 */

import nock from 'nock';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';

export const BASE_HOST = 'https://api.test';
export const BASE_PATH = '/api';
export const BASE_URL  = `${BASE_HOST}${BASE_PATH}`;

let store: Record<string, string | null> = {};

const mockGet = SecureStore.getItemAsync as unknown as ReturnType<typeof jest.fn>;
const mockSet = SecureStore.setItemAsync as unknown as ReturnType<typeof jest.fn>;

export function resetApiTest() {
  jest.clearAllMocks();
  nock.cleanAll();
  nock.disableNetConnect();
  store = { access_token: 'TEST_ACCESS', refresh_token: 'TEST_REFRESH' };
  mockGet.mockImplementation(async (key: string) => store[key] ?? null);
  mockSet.mockImplementation(async (key: string, value: string) => {
    store[key] = value;
  });
  (useAuthStore as any).getState = () => ({ logout: jest.fn() });
}

/**
 * Re-require an api module after resetting modules so apiClient is fresh.
 * Use the literal name (e.g. 'tenants') not a path.
 */
export function loadApi<T = any>(name: string): T {
  jest.resetModules();
  jest.doMock('expo-secure-store', () => SecureStore);
  jest.doMock('expo-router', () => ({ router }));
  jest.doMock('@/lib/stores/auth-store', () => ({ useAuthStore }));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(`@/lib/api/${name}`) as T;
}
