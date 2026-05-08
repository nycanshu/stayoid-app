import { propertyFormSchema } from '@/lib/validations/property';
import { tenantFormSchema } from '@/lib/validations/tenant';
import { paymentFormSchema } from '@/lib/validations/payment';
import { floorFormSchema } from '@/lib/validations/floor';
import { unitFormSchema } from '@/lib/validations/unit';
import { slotFormSchema } from '@/lib/validations/slot';

const validProperty = {
  name: 'Sunrise PG',
  property_type: 'PG' as const,
  address: '123 Park Street',
};

const validTenant = {
  name: 'Himanshu Kumar',
  phone: '9876543210',
  gender: 'MALE' as const,
  permanent_address: 'Jaipur',
  join_date: '2026-01-01',
  deposit_amount: '5000',
  slot_id: 'uuid-123',
};

const validPayment = {
  tenant_id: 'uuid-123',
  amount: '18000',
  payment_for_month: 5,
  payment_for_year: 2026,
  payment_method: 'CASH' as const,
  payment_status: 'PAID' as const,
};

describe('propertyFormSchema', () => {
  it('accepts a valid property', () => {
    expect(propertyFormSchema.safeParse(validProperty).success).toBe(true);
  });

  it('trims name and address before length checks', () => {
    const r = propertyFormSchema.safeParse({
      ...validProperty,
      name: '  Sunrise PG  ',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe('Sunrise PG');
  });

  it('rejects empty name (after trim)', () => {
    const r = propertyFormSchema.safeParse({ ...validProperty, name: '   ' });
    expect(r.success).toBe(false);
  });

  it('rejects names over 255 chars', () => {
    const r = propertyFormSchema.safeParse({
      ...validProperty,
      name: 'a'.repeat(256),
    });
    expect(r.success).toBe(false);
  });

  it('only accepts PG or FLAT for property_type', () => {
    expect(propertyFormSchema.safeParse({
      ...validProperty,
      property_type: 'HOSTEL' as any,
    }).success).toBe(false);
  });

  it('rejects empty address', () => {
    expect(propertyFormSchema.safeParse({ ...validProperty, address: '' }).success).toBe(false);
    expect(propertyFormSchema.safeParse({ ...validProperty, address: '   ' }).success).toBe(false);
  });
});

describe('tenantFormSchema', () => {
  it('accepts a fully valid tenant', () => {
    expect(tenantFormSchema.safeParse(validTenant).success).toBe(true);
  });

  it('rejects phone that is not exactly 10 digits', () => {
    const cases = ['12345', '1234567890123', 'abcdefghij', '98765432a0', '+919876543210'];
    for (const phone of cases) {
      expect(tenantFormSchema.safeParse({ ...validTenant, phone }).success).toBe(false);
    }
  });

  it('accepts a valid 10-digit phone', () => {
    expect(tenantFormSchema.safeParse({ ...validTenant, phone: '9876543210' }).success).toBe(true);
  });

  it('only accepts MALE/FEMALE/OTHER for gender', () => {
    expect(tenantFormSchema.safeParse({
      ...validTenant, gender: 'M' as any,
    }).success).toBe(false);
  });

  it('requires a non-empty join_date', () => {
    expect(tenantFormSchema.safeParse({ ...validTenant, join_date: '' }).success).toBe(false);
  });

  it('rejects negative deposit', () => {
    const r = tenantFormSchema.safeParse({ ...validTenant, deposit_amount: '-100' });
    expect(r.success).toBe(false);
  });

  it('rejects non-numeric deposit', () => {
    const r = tenantFormSchema.safeParse({ ...validTenant, deposit_amount: 'abc' });
    expect(r.success).toBe(false);
  });

  it('accepts zero deposit (some owners waive)', () => {
    const r = tenantFormSchema.safeParse({ ...validTenant, deposit_amount: '0' });
    expect(r.success).toBe(true);
  });

  it('accepts empty string for optional email', () => {
    expect(tenantFormSchema.safeParse({
      ...validTenant, email: '',
    }).success).toBe(true);
  });

  it('rejects malformed email when present', () => {
    expect(tenantFormSchema.safeParse({
      ...validTenant, email: 'not-an-email',
    }).success).toBe(false);
  });

  it('accepts valid email', () => {
    expect(tenantFormSchema.safeParse({
      ...validTenant, email: 'foo@bar.com',
    }).success).toBe(true);
  });

  it('emergency_contact_phone is optional but must match phone regex if filled', () => {
    expect(tenantFormSchema.safeParse({
      ...validTenant, emergency_contact_phone: '',
    }).success).toBe(true);
    expect(tenantFormSchema.safeParse({
      ...validTenant, emergency_contact_phone: '9876543210',
    }).success).toBe(true);
    expect(tenantFormSchema.safeParse({
      ...validTenant, emergency_contact_phone: '12345',
    }).success).toBe(false);
  });

  it('requires slot_id (no anonymous tenants)', () => {
    expect(tenantFormSchema.safeParse({ ...validTenant, slot_id: '' }).success).toBe(false);
  });
});

describe('paymentFormSchema', () => {
  it('accepts a valid payment', () => {
    expect(paymentFormSchema.safeParse(validPayment).success).toBe(true);
  });

  it('rejects non-numeric amount', () => {
    expect(paymentFormSchema.safeParse({
      ...validPayment, amount: 'free',
    }).success).toBe(false);
  });

  it('rejects negative amount', () => {
    expect(paymentFormSchema.safeParse({
      ...validPayment, amount: '-100',
    }).success).toBe(false);
  });

  it('clamps payment_for_month to 1..12', () => {
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_month: 0 }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_month: 13 }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_month: 1 }).success).toBe(true);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_month: 12 }).success).toBe(true);
  });

  it('rejects fractional month', () => {
    expect(paymentFormSchema.safeParse({
      ...validPayment, payment_for_month: 5.5,
    }).success).toBe(false);
  });

  it('clamps year to 2000..2100', () => {
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_year: 1999 }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_year: 2101 }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_year: 2000 }).success).toBe(true);
    expect(paymentFormSchema.safeParse({ ...validPayment, payment_for_year: 2100 }).success).toBe(true);
  });

  it('only accepts known payment_method values', () => {
    expect(paymentFormSchema.safeParse({
      ...validPayment, payment_method: 'BANK_TRANSFER' as any, // backend rejects this name too
    }).success).toBe(false);
    for (const m of ['CASH', 'UPI', 'BANK', 'CARD', 'CHEQUE', 'OTHER']) {
      expect(paymentFormSchema.safeParse({
        ...validPayment, payment_method: m as any,
      }).success).toBe(true);
    }
  });

  it('only accepts known payment_status values', () => {
    expect(paymentFormSchema.safeParse({
      ...validPayment, payment_status: 'REFUNDED' as any,
    }).success).toBe(false);
  });
});

describe('floorFormSchema', () => {
  it('accepts integer floors -2..99', () => {
    for (const n of [-2, -1, 0, 1, 50, 99]) {
      expect(floorFormSchema.safeParse({ floor_number: String(n) }).success).toBe(true);
    }
  });

  it('rejects out-of-range', () => {
    expect(floorFormSchema.safeParse({ floor_number: '-3' }).success).toBe(false);
    expect(floorFormSchema.safeParse({ floor_number: '100' }).success).toBe(false);
  });

  it('rejects non-integer', () => {
    expect(floorFormSchema.safeParse({ floor_number: '1.5' }).success).toBe(false);
    expect(floorFormSchema.safeParse({ floor_number: 'abc' }).success).toBe(false);
    expect(floorFormSchema.safeParse({ floor_number: '' }).success).toBe(false);
  });

  it('accepts an optional name within length bound', () => {
    expect(floorFormSchema.safeParse({ floor_number: '1', name: 'Suites' }).success).toBe(true);
  });

  it('rejects names over 80 chars', () => {
    expect(floorFormSchema.safeParse({
      floor_number: '1',
      name: 'a'.repeat(81),
    }).success).toBe(false);
  });
});

describe('unitFormSchema', () => {
  it('accepts a basic unit with default capacity', () => {
    const r = unitFormSchema.safeParse({ unit_number: '101' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capacity).toBe(1);
  });

  it('coerces capacity from string (TextInput passes strings)', () => {
    const r = unitFormSchema.safeParse({ unit_number: '101', capacity: '4' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.capacity).toBe(4);
  });

  it('rejects capacity below 1 or above 20', () => {
    expect(unitFormSchema.safeParse({ unit_number: '101', capacity: 0 }).success).toBe(false);
    expect(unitFormSchema.safeParse({ unit_number: '101', capacity: 21 }).success).toBe(false);
  });

  it('rejects non-integer capacity', () => {
    expect(unitFormSchema.safeParse({ unit_number: '101', capacity: 2.5 }).success).toBe(false);
  });

  it('requires unit_number after trim', () => {
    expect(unitFormSchema.safeParse({ unit_number: '   ' }).success).toBe(false);
    expect(unitFormSchema.safeParse({ unit_number: '' }).success).toBe(false);
  });
});

describe('slotFormSchema', () => {
  it('accepts a valid slot', () => {
    expect(slotFormSchema.safeParse({
      slot_number: 'A',
      monthly_rent: '6000',
    }).success).toBe(true);
  });

  it('rejects non-numeric or negative rent', () => {
    expect(slotFormSchema.safeParse({
      slot_number: 'A', monthly_rent: 'free',
    }).success).toBe(false);
    expect(slotFormSchema.safeParse({
      slot_number: 'A', monthly_rent: '-100',
    }).success).toBe(false);
  });

  it('accepts zero rent (a free bed in a hostel exists)', () => {
    expect(slotFormSchema.safeParse({
      slot_number: 'A', monthly_rent: '0',
    }).success).toBe(true);
  });

  it('accepts decimal rent strings (form passes through whatever user types)', () => {
    expect(slotFormSchema.safeParse({
      slot_number: 'A', monthly_rent: '5500.50',
    }).success).toBe(true);
  });

  it('requires slot_number after trim', () => {
    expect(slotFormSchema.safeParse({
      slot_number: '   ', monthly_rent: '6000',
    }).success).toBe(false);
  });

  it('accepts empty optional name', () => {
    expect(slotFormSchema.safeParse({
      slot_number: 'A', name: '', monthly_rent: '6000',
    }).success).toBe(true);
  });
});
