import nock from 'nock';
import { BASE_HOST, BASE_PATH, loadApi, resetApiTest } from './_helpers';

beforeEach(() => resetApiTest());
afterAll(() => nock.enableNetConnect());

interface AuthModule {
  authApi: {
    login: (data: any) => Promise<any>;
    signup: (data: any) => Promise<any>;
    google: (idToken: string) => Promise<any>;
    me: () => Promise<any>;
    updateMe: (data: any) => Promise<any>;
    logout: (refresh: string) => Promise<any>;
    forgotPassword: (email: string) => Promise<any>;
  };
}

function api() { return loadApi<AuthModule>('auth').authApi; }

describe('authApi — credential endpoints', () => {
  it('POST /auth/login/ with email + password (trailing slash matters)', async () => {
    const body = { email: 'h@example.com', password: 'secret123' };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/login/`, body)
      .reply(200, { access: 'A', refresh: 'R' });
    const r = await api().login(body);
    expect(r).toEqual({ access: 'A', refresh: 'R' });
    expect(scope.isDone()).toBe(true);
  });

  it('POST /auth/signup/ with name, email, password', async () => {
    const body = { name: 'Himanshu', email: 'h@e.com', password: 'p1234567' };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/signup/`, body)
      .reply(201, { access: 'A', refresh: 'R' });
    await api().signup(body);
    expect(scope.isDone()).toBe(true);
  });

  it('POST /auth/google/ with id_token (NOT idToken)', async () => {
    // Backend expects snake_case `id_token` — easy to typo.
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/google/`, { id_token: 'GOOGLE_ID_TOKEN' })
      .reply(200, {
        access: 'A', refresh: 'R', created: false,
        user: { id: 1, name: 'Himanshu', email: 'h@e.com', date_joined: '' },
      });
    const r = await api().google('GOOGLE_ID_TOKEN');
    expect(r.created).toBe(false);
    expect(scope.isDone()).toBe(true);
  });

  it('POST /auth/forgot-password/ with email', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/forgot-password/`, { email: 'h@e.com' })
      .reply(200, { sent: true });
    await api().forgotPassword('h@e.com');
    expect(scope.isDone()).toBe(true);
  });
});

describe('authApi — session endpoints', () => {
  it('GET /auth/me/ uses bearer token from secure store', async () => {
    const scope = nock(BASE_HOST, {
      reqheaders: { Authorization: 'Bearer TEST_ACCESS' },
    })
      .get(`${BASE_PATH}/auth/me/`)
      .reply(200, { id: 1, name: 'Himanshu', email: 'h@e.com', date_joined: '' });
    await api().me();
    expect(scope.isDone()).toBe(true);
  });

  it('PATCH /auth/me/ for profile updates', async () => {
    const scope = nock(BASE_HOST)
      .patch(`${BASE_PATH}/auth/me/`, { name: 'New Name' })
      .reply(200, {});
    await api().updateMe({ name: 'New Name' });
    expect(scope.isDone()).toBe(true);
  });

  it('POST /auth/logout/ sends refresh token in body for invalidation', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/auth/logout/`, { refresh: 'R' })
      .reply(204, '');
    await api().logout('R');
    expect(scope.isDone()).toBe(true);
  });
});
