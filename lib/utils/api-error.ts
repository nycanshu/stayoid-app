import { AxiosError } from 'axios';

/**
 * Backend error envelope:
 *   ServiceException -> { error, code, status_code }
 *   DRF ValidationError -> { error: 'Validation failed', errors: { field: msg }, ... }
 */
interface BackendError {
  error?: string;
  errors?: Record<string, string | string[]>;
  detail?: string;
}

const FALLBACK = 'Something went wrong. Please try again.';

export function getApiErrorMessage(err: unknown, fallback: string = FALLBACK): string {
  if (!(err instanceof AxiosError)) return fallback;

  const data = err.response?.data as BackendError | undefined;
  if (!data) return err.message || fallback;

  if (data.errors && typeof data.errors === 'object') {
    const first = Object.entries(data.errors)[0];
    if (first) {
      const [field, msg] = first;
      const text = Array.isArray(msg) ? msg[0] : msg;
      return field === 'non_field_errors' ? text : `${field}: ${text}`;
    }
  }

  return data.error || data.detail || fallback;
}
