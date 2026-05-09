import nock from 'nock';
import { BASE_HOST, BASE_PATH, loadApi, resetApiTest } from './_helpers';

beforeEach(() => resetApiTest());
afterAll(() => nock.enableNetConnect());

interface PaymentsApi {
  paymentsApi: {
    list: (params?: any) => Promise<any>;
    listPaginated: (params?: any) => Promise<any>;
    create: (data: any) => Promise<any>;
    delete: (id: string) => Promise<any>;
  };
}

function api() { return loadApi<PaymentsApi>('payments').paymentsApi; }

describe('paymentsApi.list — filter contract', () => {
  it('GET /payments/ with no params', async () => {
    const scope = nock(BASE_HOST).get(`${BASE_PATH}/payments/`).reply(200, []);
    await api().list();
    expect(scope.isDone()).toBe(true);
  });

  it('month + year filter (the Payments tab month picker)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ month: '5', year: '2026' })
      .reply(200, []);
    await api().list({ month: 5, year: 2026 });
    expect(scope.isDone()).toBe(true);
  });

  it('boundary months: month=1 January and month=12 December', async () => {
    nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ month: '1', year: '2026' })
      .reply(200, []);
    await api().list({ month: 1, year: 2026 });

    nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ month: '12', year: '2025' })
      .reply(200, []);
    await api().list({ month: 12, year: 2025 });
  });

  it('tenant_id filter (used on tenant detail)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ tenant_id: 'uuid-tenant' })
      .reply(200, []);
    await api().list({ tenant_id: 'uuid-tenant' });
    expect(scope.isDone()).toBe(true);
  });

  it('property_id filter (property-scoped payments)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ property_id: 'uuid-prop' })
      .reply(200, []);
    await api().list({ property_id: 'uuid-prop' });
    expect(scope.isDone()).toBe(true);
  });

  it('combines month + year + property_id (Payments tab + property selector)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ month: '5', year: '2026', property_id: 'uuid-prop' })
      .reply(200, []);
    await api().list({ month: 5, year: 2026, property_id: 'uuid-prop' });
    expect(scope.isDone()).toBe(true);
  });

  it('status=PAID for the "Paid" filter chip', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ status: 'PAID' })
      .reply(200, []);
    await api().list({ status: 'PAID' });
    expect(scope.isDone()).toBe(true);
  });

  it('passes ordering=property for grouped view', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ ordering: 'property', month: '5', year: '2026' })
      .reply(200, []);
    await api().list({ ordering: 'property', month: 5, year: 2026 });
    expect(scope.isDone()).toBe(true);
  });

  it('pagination params (page + page_size)', async () => {
    const scope = nock(BASE_HOST)
      .get(`${BASE_PATH}/payments/`)
      .query({ page: '2', page_size: '20' })
      .reply(200, []);
    await api().list({ page: 2, page_size: 20 });
    expect(scope.isDone()).toBe(true);
  });
});

describe('paymentsApi.create — body contract', () => {
  it('POST /payments/ with the documented payload shape', async () => {
    const body = {
      tenant_id: 'uuid-tenant',
      amount: '18000',
      payment_for_month: 5,
      payment_for_year: 2026,
      payment_method: 'CASH',
      payment_status: 'PAID',
      payment_date: '2026-05-08',
    };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/payments/`, body)
      .reply(201, { id: 'pay-1', ...body });
    const r = await api().create(body);
    expect(r.id).toBe('pay-1');
    expect(scope.isDone()).toBe(true);
  });

  it('accepts payment_method=BANK (not BANK_TRANSFER — backend rejects that)', async () => {
    const body = {
      tenant_id: 'x', amount: '1', payment_for_month: 1, payment_for_year: 2026,
      payment_method: 'BANK', payment_status: 'PAID',
    };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/payments/`, body)
      .reply(201, body);
    await api().create(body);
    expect(scope.isDone()).toBe(true);
  });

  it('does not include undefined optional fields (notes/payment_date)', async () => {
    const body = {
      tenant_id: 'x', amount: '1', payment_for_month: 1, payment_for_year: 2026,
      payment_method: 'CASH', payment_status: 'PAID',
    };
    const scope = nock(BASE_HOST)
      .post(`${BASE_PATH}/payments/`, (received) => {
        // Payload should NOT contain `notes` or `payment_date` if undefined.
        expect(received).toEqual(body);
        expect('notes' in received).toBe(false);
        expect('payment_date' in received).toBe(false);
        return true;
      })
      .reply(201, body);
    await api().create(body as any);
    expect(scope.isDone()).toBe(true);
  });
});

describe('paymentsApi.delete', () => {
  it('DELETE /payments/{id}/', async () => {
    const scope = nock(BASE_HOST)
      .delete(`${BASE_PATH}/payments/pay-1/`)
      .reply(204, '');
    await api().delete('pay-1');
    expect(scope.isDone()).toBe(true);
  });
});
