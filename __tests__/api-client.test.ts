/**
 * api-client tests
 *
 * Approach: nock intercepts at Node's http layer, which means axios's actual
 * adapter is hit on every call (initial + retry) and we don't have to fight
 * axios's internal adapter resolution. This made the suite far more reliable
 * than swapping `defaults.adapter` mid-flight.
 */

import nock from 'nock';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth-store';

const BASE_HOST = 'https://api.test';
const BASE_PATH = '/api';

function loadClient() {
  jest.resetModules();
  jest.doMock('expo-secure-store', () => SecureStore);
  jest.doMock('expo-router', () => ({ router }));
  jest.doMock('@/lib/stores/auth-store', () => ({ useAuthStore }));
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@/lib/api/client').default as ReturnType<typeof axios.create>;
}

const mockGet     = SecureStore.getItemAsync as unknown as jest.Mock;
const mockSet     = SecureStore.setItemAsync as unknown as jest.Mock;
const mockReplace = router.replace as unknown as jest.Mock;
const mockLogout  = jest.fn();

beforeAll(() => {
  // Block any unintended real network. Tests only succeed if every endpoint
  // is explicitly intercepted by nock.
  nock.disableNetConnect();
});
afterAll(() => {
  nock.enableNetConnect();
});

// Stateful in-memory store so writes from the refresh path are visible to
// subsequent reads from the request interceptor on retry.
let store: Record<string, string | null> = {};

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  store = { access_token: 'OLD_ACCESS', refresh_token: 'OLD_REFRESH' };
  mockGet.mockImplementation(async (key: string) => store[key] ?? null);
  mockSet.mockImplementation(async (key: string, value: string) => {
    store[key] = value;
  });
  (useAuthStore as any).getState = () => ({ logout: mockLogout });
  mockLogout.mockResolvedValue(undefined);
});

describe('api-client — auth refresh', () => {
  it('attaches Bearer token to every request', async () => {
    const apiClient = loadClient();
    const scope = nock(BASE_HOST, {
      reqheaders: { Authorization: 'Bearer OLD_ACCESS' },
    })
      .get(`${BASE_PATH}/me`)
      .reply(200, { ok: true });

    const res = await apiClient.get('/me');
    expect(res.data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });

  it('refreshes and retries on 401', async () => {
    const apiClient = loadClient();

    // First /me: 401. Refresh: 200 with new tokens. Retried /me: 200.
    nock(BASE_HOST)
      .get(`${BASE_PATH}/me`)
      .matchHeader('Authorization', 'Bearer OLD_ACCESS')
      .reply(401, { code: 'invalid_token' });
    nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/refresh/`, { refresh: 'OLD_REFRESH' })
      .reply(200, { access: 'NEW_ACCESS', refresh: 'NEW_REFRESH' });
    nock(BASE_HOST)
      .get(`${BASE_PATH}/me`)
      .matchHeader('Authorization', 'Bearer NEW_ACCESS')
      .reply(200, { ok: true });

    const res = await apiClient.get('/me');

    expect(res.data).toEqual({ ok: true });
    expect(mockSet).toHaveBeenCalledWith('access_token', 'NEW_ACCESS');
    expect(mockSet).toHaveBeenCalledWith('refresh_token', 'NEW_REFRESH');
    expect(nock.pendingMocks()).toHaveLength(0);
  });

  it('coalesces concurrent 401s into a single refresh call (single-flight)', async () => {
    const apiClient = loadClient();

    let refreshHits = 0;
    // Three endpoints each respond 401 once, then 200.
    for (const url of ['/a', '/b', '/c']) {
      nock(BASE_HOST)
        .get(`${BASE_PATH}${url}`)
        .matchHeader('Authorization', 'Bearer OLD_ACCESS')
        .reply(401, { code: 'invalid_token' });
      nock(BASE_HOST)
        .get(`${BASE_PATH}${url}`)
        .matchHeader('Authorization', 'Bearer NEW_ACCESS')
        .reply(200, { url });
    }
    nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/refresh/`)
      .reply(() => {
        refreshHits += 1;
        // Simulate latency so 3 concurrent 401s genuinely pile up while
        // the refresh is in-flight.
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, { access: 'NEW_ACCESS' }]), 25);
        }) as any;
      })
      .persist();

    const [a, b, c] = await Promise.all([
      apiClient.get('/a'),
      apiClient.get('/b'),
      apiClient.get('/c'),
    ]);

    expect(a.data.url).toBe('/a');
    expect(b.data.url).toBe('/b');
    expect(c.data.url).toBe('/c');
    // Critical guarantee: 3 concurrent 401s → exactly 1 refresh.
    expect(refreshHits).toBe(1);
    nock.cleanAll();
  });

  it('does NOT retry on 401 for /auth/login (no infinite refresh on bad creds)', async () => {
    const apiClient = loadClient();
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/login`)
      .reply(401, { code: 'authentication_error' });

    await expect(
      apiClient.post('/auth/login', { email: 'x', password: 'y' }),
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(scope.isDone()).toBe(true);
    expect(mockLogout).not.toHaveBeenCalled();
    // No /auth/refresh request was registered, so the absence of a 'pending
    // mock not consumed' error confirms refresh was never attempted.
  });

  it('bounces to login when refresh itself fails', async () => {
    const apiClient = loadClient();
    nock(BASE_HOST).get(`${BASE_PATH}/me`).reply(401, { code: 'invalid_token' });
    nock(BASE_HOST).post(`${BASE_PATH}/auth/refresh/`).reply(401, { code: 'invalid_token' });

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('bounces to login when no refresh token in storage', async () => {
    mockGet.mockImplementation(async (key: string) => {
      if (key === 'access_token') return 'OLD_ACCESS';
      return null;
    });
    const apiClient = loadClient();
    nock(BASE_HOST).get(`${BASE_PATH}/me`).reply(401, { code: 'invalid_token' });

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    // No refresh request defined ⇒ if the client had attempted one it would
    // have errored on net-connect-disallowed.
  });

  it('does not retry the same request twice (no infinite loop on persistent 401)', async () => {
    const apiClient = loadClient();

    let calls = 0;
    nock(BASE_HOST)
      .persist()
      .get(`${BASE_PATH}/me`)
      .reply(() => {
        calls += 1;
        return [401, { code: 'invalid_token' }] as any;
      });
    nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/refresh/`)
      .reply(200, { access: 'NEW_ACCESS' });

    await expect(apiClient.get('/me')).rejects.toBeDefined();

    // First call + 1 retry only — `_retry` flag stops further attempts.
    expect(calls).toBe(2);
    nock.cleanAll();
  });

  it('skips storing refresh token when response has no rotated refresh', async () => {
    const apiClient = loadClient();
    nock(BASE_HOST).get(`${BASE_PATH}/me`).reply(401, { code: 'invalid_token' });
    nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/refresh/`)
      .reply(200, { access: 'NEW_ACCESS' /* no refresh */ });
    nock(BASE_HOST).get(`${BASE_PATH}/me`).reply(200, { ok: true });

    await apiClient.get('/me');

    expect(mockSet).toHaveBeenCalledWith('access_token', 'NEW_ACCESS');
    expect(mockSet).not.toHaveBeenCalledWith('refresh_token', expect.anything());
  });

  it('does not refresh on non-401 responses', async () => {
    const apiClient = loadClient();
    nock(BASE_HOST).get(`${BASE_PATH}/me`).reply(403, { code: 'permission_denied' });

    await expect(apiClient.get('/me')).rejects.toMatchObject({
      response: { status: 403 },
    });
    // No /auth/refresh nock registered — would have errored on the wire if attempted.
  });
});
