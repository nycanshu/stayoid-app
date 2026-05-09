import nock from 'nock';
import { BASE_HOST, BASE_PATH, loadApi, resetApiTest } from './_helpers';

beforeEach(() => resetApiTest());
afterAll(() => nock.enableNetConnect());

interface TenantsApi {
  tenantsApi: {
    list: (params?: any) => Promise<any>;
    listPaginated: (params?: any) => Promise<any>;
    bySlug: (slug: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    exit: (id: string, exit_date: string) => Promise<any>;
    restore: (id: string) => Promise<any>;
  };
}

function api() { return loadApi<TenantsApi>('tenants').tenantsApi; }

describe('tenantsApi.list — filter contract', () => {
  it('GET /tenants/ with no params', async () => {
    const scope = nock(BASE_HOST).get(`${BASE_PATH}/tenants/`).reply(200, []);
    await api().list();
    expect(scope.isDone()).toBe(true);
  });

  it('passes query string for property_id (used by property detail)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ property_id: 'uuid-prop' })
      .reply(200, []);
    await api().list({ property_id: 'uuid-prop' });
    expect(scope.isDone()).toBe(true);
  });

  it('serialises booleans as strings (active filter)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ active: 'true' })
      .reply(200, []);
    await api().list({ active: true });
    expect(scope.isDone()).toBe(true);
  });

  it('serialises false the same way', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ active: 'false' })
      .reply(200, []);
    await api().list({ active: false });
    expect(scope.isDone()).toBe(true);
  });

  it('combines unpaid + month + year (used by Payments tab)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ unpaid: 'true', month: '5', year: '2026' })
      .reply(200, []);
    await api().list({ unpaid: true, month: 5, year: 2026 });
    expect(scope.isDone()).toBe(true);
  });

  it('passes free-text query as ?query=', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ query: 'rohan' })
      .reply(200, []);
    await api().list({ query: 'rohan' });
    expect(scope.isDone()).toBe(true);
  });

  it('combines property_id + active + query for tenants tab filter', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ property_id: 'uuid', active: 'true', query: 'k' })
      .reply(200, []);
    await api().list({ property_id: 'uuid', active: true, query: 'k' });
    expect(scope.isDone()).toBe(true);
  });

  it('passes ordering=property when grouping by property', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ ordering: 'property' })
      .reply(200, []);
    await api().list({ ordering: 'property' });
    expect(scope.isDone()).toBe(true);
  });

  it('strips undefined fields (does not send empty params)', async () => {
    // axios drops undefined query params entirely.
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/`)
      .query({ active: 'true' })
      .reply(200, []);
    await api().list({
      active: true,
      query: undefined,
      property_id: undefined,
    });
    expect(scope.isDone()).toBe(true);
  });
});

describe('tenantsApi.list — response shape handling', () => {
  it('unwraps a paginated envelope (DRF default)', async () => {
    nock(BASE_HOST).get(`${BASE_PATH}/tenants/`).reply(200, {
      count: 2, next: null, previous: null,
      results: [{ id: '1' }, { id: '2' }],
    });
    const result = await api().list();
    expect(result).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('passes through a flat array (un-paginated endpoint)', async () => {
    nock(BASE_HOST).get(`${BASE_PATH}/tenants/`).reply(200, [{ id: '1' }]);
    const result = await api().list();
    expect(result).toEqual([{ id: '1' }]);
  });
});

describe('tenantsApi.listPaginated — keeps the envelope', () => {
  it('returns the envelope verbatim when paginated', async () => {
    const envelope = {
      count: 50, next: '/tenants/?page=2', previous: null,
      results: [{ id: '1' }],
    };
    nock(BASE_HOST).get(`${BASE_PATH}/tenants/`).reply(200, envelope);
    const result = await api().listPaginated();
    expect(result).toEqual(envelope);
  });

  it('synthesises an envelope when backend returns flat array', async () => {
    nock(BASE_HOST).get(`${BASE_PATH}/tenants/`).reply(200, [{ id: '1' }, { id: '2' }]);
    const result = await api().listPaginated();
    expect(result).toEqual({ count: 2, next: null, previous: null, results: [{ id: '1' }, { id: '2' }] });
  });
});

describe('tenantsApi — single + write endpoints', () => {
  it('GET /tenants/{slug}/ for bySlug', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/tenants/john-doe/`)
      .reply(200, { id: '1', slug: 'john-doe' });
    const r = await api().bySlug('john-doe');
    expect(r).toEqual({ id: '1', slug: 'john-doe' });
    expect(scope.isDone()).toBe(true);
  });

  it('POST /tenants/ with full create body', async () => {
    const body = {
      slot_id: 'slot-1', name: 'Rohan', phone: '9999999999',
      gender: 'MALE', permanent_address: 'Jaipur',
      join_date: '2026-01-01', deposit_amount: '5000',
    };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/tenants/`, body)
      .reply(201, { id: 'new', ...body });
    const r = await api().create(body);
    expect(r.id).toBe('new');
    expect(scope.isDone()).toBe(true);
  });

  it('uses PUT (not PATCH) for update — backend rejects PATCH on tenants', async () => {
    const body = { name: 'Rohan Updated' };
    const scope = nock(BASE_HOST)
      .put(`${BASE_PATH}/tenants/uuid-tenant/`, body)
      .reply(200, { id: 'uuid-tenant', ...body });
    await api().update('uuid-tenant', body);
    expect(scope.isDone()).toBe(true);
  });

  it('POST /tenants/{id}/exit/ with exit_date in body', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/tenants/uuid-1/exit/`, { exit_date: '2026-05-08' })
      .reply(200, { id: 'uuid-1' });
    await api().exit('uuid-1', '2026-05-08');
    expect(scope.isDone()).toBe(true);
  });

  it('POST /tenants/{id}/restore/ with empty body', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/tenants/uuid-1/restore/`, /^$|^{}$/)
      .reply(200, { id: 'uuid-1' });
    await api().restore('uuid-1');
    expect(scope.isDone()).toBe(true);
  });
});
