import { AxiosError, AxiosHeaders } from 'axios';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/utils/api-error';
import { ERROR_MESSAGES, STATUS_FALLBACKS, GENERIC_FALLBACK } from '@/lib/api/error-codes';

/**
 * Build an AxiosError with a synthetic response body. The real axios constructs
 * these via internal interceptors so we recreate the surface here.
 */
function makeAxiosError(
  status: number,
  data: unknown,
  opts?: { code?: string; noResponse?: boolean },
): AxiosError {
  const err = new AxiosError(
    `Request failed with status code ${status}`,
    opts?.code ?? 'ERR_BAD_REQUEST',
    undefined,
    undefined,
    opts?.noResponse ? undefined : {
      status,
      statusText: 'Error',
      data,
      headers: {},
      config: { headers: new AxiosHeaders() } as any,
    } as any,
  );
  return err;
}

function makeNetworkError(code = 'ERR_NETWORK'): AxiosError {
  return new AxiosError('Network Error', code, undefined, undefined, undefined);
}

describe('getApiErrorMessage — code lookup (priority 1)', () => {
  it('returns the friendly message for a known code', () => {
    const err = makeAxiosError(409, { error: 'raw msg', code: 'slot_occupied' });
    expect(getApiErrorMessage(err)).toBe(ERROR_MESSAGES.slot_occupied);
  });

  it('takes code priority over data.error/detail', () => {
    const err = makeAxiosError(400, {
      error: 'should be ignored',
      detail: 'should be ignored',
      code: 'phone_already_registered',
    });
    expect(getApiErrorMessage(err)).toBe(ERROR_MESSAGES.phone_already_registered);
  });

  it('matches every documented error code (regression guard)', () => {
    // If a code is removed from ERROR_MESSAGES, this test fails fast.
    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      const err = makeAxiosError(400, { code, error: 'irrelevant' });
      expect(getApiErrorMessage(err)).toBe(message);
    }
  });
});

describe('getApiErrorMessage — DRF validation errors (priority 2)', () => {
  it('formats first field error with prettified field name', () => {
    const err = makeAxiosError(400, {
      error: 'Validation failed',
      code: 'unknown_validation_code',
      errors: { phone: 'Must be 10 digits' },
    });
    expect(getApiErrorMessage(err)).toBe('Phone: Must be 10 digits');
  });

  it('handles arrays of messages (DRF default)', () => {
    const err = makeAxiosError(400, {
      errors: { phone: ['Must be 10 digits', 'Already exists'] },
    });
    expect(getApiErrorMessage(err)).toBe('Phone: Must be 10 digits');
  });

  it('strips underscores and capitalises field name', () => {
    const err = makeAxiosError(400, {
      errors: { permanent_address: 'Required' },
    });
    expect(getApiErrorMessage(err)).toBe('Permanent Address: Required');
  });

  it('drops the field prefix for non_field_errors', () => {
    const err = makeAxiosError(400, {
      errors: { non_field_errors: 'Slot is unavailable' },
    });
    expect(getApiErrorMessage(err)).toBe('Slot is unavailable');
  });

  it('skips empty error map (falls through to data.error)', () => {
    const err = makeAxiosError(400, { errors: {}, error: 'Real error' });
    expect(getApiErrorMessage(err)).toBe('Real error');
  });

  it('validation_error code beats per-field errors (by design)', () => {
    // ERROR_MESSAGES.validation_error wins because code lookup runs first.
    // This is intentional — generic "Please check the highlighted fields"
    // is preferred while inline form errors handle field-level detail.
    const err = makeAxiosError(400, {
      code: 'validation_error',
      errors: { email: 'Invalid email' },
    });
    expect(getApiErrorMessage(err)).toBe(ERROR_MESSAGES.validation_error);
  });
});

describe('getApiErrorMessage — raw backend message (priority 3)', () => {
  it('uses data.error when no code match and no validation errors', () => {
    const err = makeAxiosError(400, { error: 'Custom message from API' });
    expect(getApiErrorMessage(err)).toBe('Custom message from API');
  });

  it('uses data.detail (DRF default 401/403 envelope)', () => {
    const err = makeAxiosError(401, { detail: 'Authentication credentials were not provided.' });
    expect(getApiErrorMessage(err)).toBe('Authentication credentials were not provided.');
  });

  it('prefers data.error over data.detail when both present', () => {
    const err = makeAxiosError(400, { error: 'A', detail: 'B' });
    expect(getApiErrorMessage(err)).toBe('A');
  });
});

describe('getApiErrorMessage — status fallback (priority 4)', () => {
  it.each(Object.entries(STATUS_FALLBACKS))(
    'uses fallback for status %s when body has no useful message',
    (statusStr, expected) => {
      const status = Number(statusStr);
      const err = makeAxiosError(status, undefined);
      expect(getApiErrorMessage(err)).toBe(expected);
    },
  );

  it('uses generic fallback for unmapped status (e.g. 418)', () => {
    const err = makeAxiosError(418, undefined);
    expect(getApiErrorMessage(err)).toBe(GENERIC_FALLBACK);
  });

  it('honours custom fallback for unmapped status', () => {
    const err = makeAxiosError(418, undefined);
    expect(getApiErrorMessage(err, 'My fallback')).toBe('My fallback');
  });
});

describe('getApiErrorMessage — network errors', () => {
  it('returns timeout message for ECONNABORTED', () => {
    const err = makeNetworkError('ECONNABORTED');
    expect(getApiErrorMessage(err)).toBe('Request timed out. Check your connection.');
  });

  it('returns offline message for generic network error', () => {
    const err = makeNetworkError('ERR_NETWORK');
    expect(getApiErrorMessage(err)).toBe("Couldn't reach the server. Check your connection.");
  });
});

describe('getApiErrorMessage — non-axios inputs', () => {
  it('returns the message of a plain Error', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back to GENERIC_FALLBACK for unknown values', () => {
    expect(getApiErrorMessage(undefined)).toBe(GENERIC_FALLBACK);
    expect(getApiErrorMessage(null)).toBe(GENERIC_FALLBACK);
    expect(getApiErrorMessage('string error')).toBe(GENERIC_FALLBACK);
    expect(getApiErrorMessage({ random: 'object' })).toBe(GENERIC_FALLBACK);
  });

  it('honours custom fallback', () => {
    expect(getApiErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
  });

  it('uses Error.message even when message is empty (falls through to fallback)', () => {
    expect(getApiErrorMessage(new Error(''))).toBe(GENERIC_FALLBACK);
  });
});

describe('getApiFieldErrors', () => {
  it('returns null for non-axios errors', () => {
    expect(getApiFieldErrors(new Error('not axios'))).toBeNull();
    expect(getApiFieldErrors(undefined)).toBeNull();
  });

  it('returns null when there is no errors object', () => {
    const err = makeAxiosError(400, { error: 'no field details', code: 'x' });
    expect(getApiFieldErrors(err)).toBeNull();
  });

  it('flattens string-or-array messages per field', () => {
    const err = makeAxiosError(400, {
      errors: {
        email: 'Invalid email',
        phone: ['Must be 10 digits'],
        name: ['Required', 'Too short'],
      },
    });
    expect(getApiFieldErrors(err)).toEqual({
      email: 'Invalid email',
      phone: 'Must be 10 digits',
      name: 'Required', // first message wins
    });
  });

  it('returns empty map when errors is empty object (caller can decide)', () => {
    const err = makeAxiosError(400, { errors: {} });
    expect(getApiFieldErrors(err)).toEqual({});
  });

  it('returns null when response has no body', () => {
    const err = makeAxiosError(500, undefined);
    expect(getApiFieldErrors(err)).toBeNull();
  });
});
