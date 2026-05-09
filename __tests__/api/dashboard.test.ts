import nock from 'nock';
import { BASE_HOST, BASE_PATH, loadApi, resetApiTest } from './_helpers';

beforeEach(() => resetApiTest());
afterAll(() => nock.enableNetConnect());

interface DashboardModule {
  dashboardApi: { get: (propertyId?: string) => Promise<any> };
}

function api() { return loadApi<DashboardModule>('dashboard').dashboardApi; }

describe('dashboardApi.get', () => {
  it('GET /dashboard/ with no params (overall view)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/dashboard/`)
      .reply(200, { summary: {}, current_month: {}, properties: [], recent_payments: [] });
    await api().get();
    expect(scope.isDone()).toBe(true);
  });

  it('does NOT send property_id when called without arg', async () => {
    // Defensive: accidentally sending property_id=undefined as a string would
    // make the backend's filter explode. We assert the URL has no querystring.
    const scope = nock(BASE_HOST)
      .get((uri) => uri === `${BASE_PATH}/dashboard/`)
      .reply(200, {});
    await api().get();
    expect(scope.isDone()).toBe(true);
  });

  it('GET /dashboard/?property_id=X when property is selected', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/dashboard/`)
      .query({ property_id: 'uuid-prop' })
      .reply(200, {});
    await api().get('uuid-prop');
    expect(scope.isDone()).toBe(true);
  });

  it('parses the dashboard envelope shape', async () => {
    const payload = {
      summary: { total_revenue: '120000.00' },
      current_month: { collected: '50000.00', expected: '80000.00' },
      properties: [{ id: 'p1', name: 'Sunrise PG' }],
      recent_payments: [{ id: 'pay1', amount: '6000' }],
    };
    nock(BASE_HOST).get(`${BASE_PATH}/dashboard/`).reply(200, payload);
    const result = await api().get();
    expect(result).toEqual(payload);
  });
});
