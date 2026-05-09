import nock from 'nock';
import { BASE_HOST, BASE_PATH, loadApi, resetApiTest } from './_helpers';

beforeEach(() => resetApiTest());
afterAll(() => nock.enableNetConnect());

interface PropertiesModule {
  propertiesApi: {
    list: () => Promise<any>;
    listPaginated: (params?: any) => Promise<any>;
    bySlug: (slug: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (slug: string, data: any) => Promise<any>;
    delete: (slug: string) => Promise<any>;
  };
  floorsApi: {
    list: (propertyId: string) => Promise<any>;
    create: (propertyId: string, data: any) => Promise<any>;
    update: (propertyId: string, floorId: string, data: any) => Promise<any>;
    delete: (propertyId: string, floorId: string) => Promise<any>;
  };
  unitsApi: {
    list: (propertyId: string, floorId: string) => Promise<any>;
    create: (propertyId: string, floorId: string, data: any) => Promise<any>;
    update: (propertyId: string, floorId: string, unitId: string, data: any) => Promise<any>;
  };
  slotsApi: {
    list: (params: any) => Promise<any>;
    listPaginated: (params?: any) => Promise<any>;
    create: (propertyId: string, floorId: string, unitId: string, data: any) => Promise<any>;
    update: (propertyId: string, floorId: string, unitId: string, slotId: string, data: any) => Promise<any>;
  };
}

function mod() { return loadApi<PropertiesModule>('properties'); }

// ─── propertiesApi ────────────────────────────────────────────────────

describe('propertiesApi.list', () => {
  it('GET /properties/ with no params', async () => {
    const scope = nock(BASE_HOST).get(`${BASE_PATH}/properties/`).reply(200, []);
    await mod().propertiesApi.list();
    expect(scope.isDone()).toBe(true);
  });

  it('unwraps paginated envelope', async () => {
    nock(BASE_HOST).get(`${BASE_PATH}/properties/`).reply(200, {
      count: 1, next: null, previous: null, results: [{ id: 'p1' }],
    });
    expect(await mod().propertiesApi.list()).toEqual([{ id: 'p1' }]);
  });
});

describe('propertiesApi.listPaginated — filter contract', () => {
  it('passes property_type filter', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/properties/`)
      .query({ property_type: 'PG' })
      .reply(200, []);
    await mod().propertiesApi.listPaginated({ property_type: 'PG' });
    expect(scope.isDone()).toBe(true);
  });

  it('passes free-text query', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/properties/`)
      .query({ query: 'sunrise' })
      .reply(200, []);
    await mod().propertiesApi.listPaginated({ query: 'sunrise' });
    expect(scope.isDone()).toBe(true);
  });
});

describe('propertiesApi — single + write endpoints', () => {
  it('GET /properties/by-slug/{slug}/ for bySlug', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/properties/by-slug/sunrise-pg/`)
      .reply(200, { id: 'p1' });
    await mod().propertiesApi.bySlug('sunrise-pg');
    expect(scope.isDone()).toBe(true);
  });

  it('POST /properties/ with full create body', async () => {
    const body = { name: 'Sunrise PG', property_type: 'PG', address: '123 Park St' };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/properties/`, body)
      .reply(201, { id: 'p1', ...body });
    await mod().propertiesApi.create(body);
    expect(scope.isDone()).toBe(true);
  });

  it('PUT /properties/by-slug/{slug}/ with partial body', async () => {
    const scope = nock(BASE_HOST)
      .put(`${BASE_PATH}/properties/by-slug/sunrise-pg/`, { name: 'New Name' })
      .reply(200, {});
    await mod().propertiesApi.update('sunrise-pg', { name: 'New Name' });
    expect(scope.isDone()).toBe(true);
  });

  it('DELETE /properties/by-slug/{slug}/', async () => {
    const scope = nock(BASE_HOST)
      .delete(`${BASE_PATH}/properties/by-slug/sunrise-pg/`)
      .reply(204, '');
    await mod().propertiesApi.delete('sunrise-pg');
    expect(scope.isDone()).toBe(true);
  });
});

// ─── floorsApi ────────────────────────────────────────────────────────

describe('floorsApi', () => {
  it('GET /properties/{id}/floors/ scoped under property', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/properties/uuid-prop/floors/`)
      .reply(200, []);
    await mod().floorsApi.list('uuid-prop');
    expect(scope.isDone()).toBe(true);
  });

  it('POST /properties/{id}/floors/ for floor creation', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/properties/uuid-prop/floors/`, { floor_number: 1 })
      .reply(201, { id: 'f1', floor_number: 1 });
    await mod().floorsApi.create('uuid-prop', { floor_number: 1 });
    expect(scope.isDone()).toBe(true);
  });

  it('PATCH /properties/{id}/floors/{floorId}/ for partial update', async () => {
    const scope = nock(BASE_HOST)
      .patch(`${BASE_PATH}/properties/uuid-prop/floors/uuid-floor/`, { name: 'Top' })
      .reply(200, {});
    await mod().floorsApi.update('uuid-prop', 'uuid-floor', { name: 'Top' });
    expect(scope.isDone()).toBe(true);
  });

  it('supports negative floor_number for basements (-2)', async () => {
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/properties/uuid-prop/floors/`, { floor_number: -2 })
      .reply(201, {});
    await mod().floorsApi.create('uuid-prop', { floor_number: -2 });
    expect(scope.isDone()).toBe(true);
  });

  it('DELETE floor', async () => {
    const scope = nock(BASE_HOST)
      .delete(`${BASE_PATH}/properties/uuid-prop/floors/uuid-floor/`)
      .reply(204, '');
    await mod().floorsApi.delete('uuid-prop', 'uuid-floor');
    expect(scope.isDone()).toBe(true);
  });
});

// ─── unitsApi ─────────────────────────────────────────────────────────

describe('unitsApi', () => {
  it('GET /properties/{id}/floors/{fid}/units/', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/properties/uuid-prop/floors/uuid-floor/units/`)
      .reply(200, []);
    await mod().unitsApi.list('uuid-prop', 'uuid-floor');
    expect(scope.isDone()).toBe(true);
  });

  it('POST unit with capacity field', async () => {
    const body = { unit_number: '101', capacity: 4 };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/properties/p/floors/f/units/`, body)
      .reply(201, body);
    await mod().unitsApi.create('p', 'f', body);
    expect(scope.isDone()).toBe(true);
  });

  it('PATCH unit for partial update (capacity bump)', async () => {
    const scope = nock(BASE_HOST)
      .patch(`${BASE_PATH}/properties/p/floors/f/units/u/`, { capacity: 5 })
      .reply(200, {});
    await mod().unitsApi.update('p', 'f', 'u', { capacity: 5 });
    expect(scope.isDone()).toBe(true);
  });
});

// ─── slotsApi ─────────────────────────────────────────────────────────

describe('slotsApi.list — filter contract', () => {
  it('GET /slots/ with property_id filter', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/slots/`)
      .query({ property_id: 'uuid-prop' })
      .reply(200, []);
    await mod().slotsApi.list({ property_id: 'uuid-prop' });
    expect(scope.isDone()).toBe(true);
  });

  it('GET /slots/ with vacant=true (Add Tenant flow)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/slots/`)
      .query({ property_id: 'uuid-prop', vacant: 'true' })
      .reply(200, []);
    await mod().slotsApi.list({ property_id: 'uuid-prop', vacant: true });
    expect(scope.isDone()).toBe(true);
  });

  it('paginated list passes ordering=property for grouped slot view', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/slots/`)
      .query({ ordering: 'property', vacant: 'true' })
      .reply(200, { count: 0, next: null, previous: null, results: [] });
    await mod().slotsApi.listPaginated({ ordering: 'property', vacant: true });
    expect(scope.isDone()).toBe(true);
  });

  it('paginated query filter for searching by slot number/tenant name', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/slots/`)
      .query({ query: 'A101' })
      .reply(200, { count: 0, next: null, previous: null, results: [] });
    await mod().slotsApi.listPaginated({ query: 'A101' });
    expect(scope.isDone()).toBe(true);
  });
});

describe('slotsApi — write endpoints', () => {
  it('POST nested under property/floor/unit', async () => {
    const body = { slot_number: 'A', monthly_rent: '6000' };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/properties/p/floors/f/units/u/slots/`, body)
      .reply(201, body);
    await mod().slotsApi.create('p', 'f', 'u', body);
    expect(scope.isDone()).toBe(true);
  });

  it('PATCH for partial slot update', async () => {
    const scope = nock(BASE_HOST)
      .patch(
        `${BASE_PATH}/properties/p/floors/f/units/u/slots/s/`,
        { monthly_rent: '7000' },
      )
      .reply(200, {});
    await mod().slotsApi.update('p', 'f', 'u', 's', { monthly_rent: '7000' });
    expect(scope.isDone()).toBe(true);
  });
});
