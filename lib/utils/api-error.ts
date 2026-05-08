import { AxiosError } from 'axios';
import { ERROR_MESSAGES, STATUS_FALLBACKS, GENERIC_FALLBACK } from '../api/error-codes';

/**
 * Backend error envelope (set by `common.exceptions.custom_exception_handler`):
 *   ServiceException        → { error, code, status_code }
 *   DRF ValidationError     → { error: 'Validation failed', code: 'validation_error',
 *                                errors: { field: msg | [msg] }, status_code: 400 }
 *   Auth                    → { error, code: 'authentication_error', status_code: 401 }
 *   404 (custom_404_handler)→ { error, code: 'not_found', path, status_code: 404 }
 */
interface BackendError {
  error?: string;
  code?: string;
  errors?: Record<string, string | string[]>;
  detail?: string;
}

/**
 * Pull a user-facing message out of an axios error.
 *
 * Resolution order:
 *   1. ERROR_MESSAGES[code]        — polished, friendly copy
 *   2. errors[<first-field>]       — for DRF validation, prefixed by field
 *   3. data.error / data.detail    — raw backend message
 *   4. STATUS_FALLBACKS[status]    — generic per-status template
 *   5. fallback / GENERIC_FALLBACK
 */
export function getApiErrorMessage(err: unknown, fallback: string = GENERIC_FALLBACK): string {
  if (!(err instanceof AxiosError)) {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  // Network / no response (e.g. server down, no internet)
  if (!err.response) {
    if (err.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    return "Couldn't reach the server. Check your connection.";
  }

  const status = err.response.status;
  const data = err.response.data as BackendError | undefined;

  if (data?.code && ERROR_MESSAGES[data.code]) {
    return ERROR_MESSAGES[data.code];
  }

  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.entries(data.errors)[0];
    if (first) {
      const [field, msg] = first;
      const text = Array.isArray(msg) ? msg[0] : msg;
      return field === 'non_field_errors' ? text : `${prettyField(field)}: ${text}`;
    }
  }

  if (data?.error) return data.error;
  if (data?.detail) return data.detail;

  if (STATUS_FALLBACKS[status]) return STATUS_FALLBACKS[status];

  return fallback;
}

/**
 * Returns the per-field error map (only for DRF validation errors). Use this
 * to set inline form errors via react-hook-form's `setError(field, { message })`.
 * Returns null if the response isn't a field-level validation error.
 */
export function getApiFieldErrors(err: unknown): Record<string, string> | null {
  if (!(err instanceof AxiosError)) return null;
  const data = err.response?.data as BackendError | undefined;
  if (!data?.errors || typeof data.errors !== 'object') return null;

  const out: Record<string, string> = {};
  for (const [field, msg] of Object.entries(data.errors)) {
    out[field] = Array.isArray(msg) ? msg[0] : msg;
  }
  return out;
}

function prettyField(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
