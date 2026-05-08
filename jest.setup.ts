/**
 * Global mocks for unit tests. Native-bridge modules don't exist in Node, so
 * any import chain that pulls them in needs a stub. Per-test mocks may
 * override these via jest.mock(...) at the top of a test file.
 */

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
}));

// The auth store touches AsyncStorage / persist middleware. The api client
// only uses `useAuthStore.getState().logout()` so we can stub the whole module.
jest.mock('@/lib/stores/auth-store', () => ({
  useAuthStore: { getState: () => ({ logout: jest.fn() }) },
}));

// Silence the in-app logger during tests; flip to console if you need to
// debug a flaky assertion locally.
jest.mock('@/lib/utils/logger', () => ({
  logger: () => ({
    debug: () => {},
    info:  () => {},
    warn:  () => {},
    error: () => {},
  }),
}));

// Default API base URL for the client tests.
process.env.EXPO_PUBLIC_API_URL = 'https://api.test/api';
