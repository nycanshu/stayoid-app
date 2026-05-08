/**
 * Backend → user-friendly error message map.
 *
 * Source of truth: every ServiceException raised in
 * `stayoid-backend/apps/*​/services.py` (and a few in views.py / serializers.py).
 * Keep this file aligned with backend codes — when a new ServiceException is
 * added on the server, add a row here too.
 *
 * Lookup priority (see getApiErrorMessage):
 *   1. ERROR_MESSAGES[data.code]      — friendly, polished copy
 *   2. data.error                     — raw backend message (already human)
 *   3. STATUS_FALLBACKS[status]       — generic per-HTTP-status template
 *   4. "Something went wrong"
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // ─── Auth & user ─────────────────────────────────────────────────────
  invalid_token:                'Your session expired. Please sign in again.',
  token_error:                  'There was a problem with your session. Please sign in again.',
  authentication_error:         'Please sign in to continue.',
  account_inactive:             'This account has been deactivated. Contact support.',
  email_exists:                 'An account with this email already exists.',
  user_not_found:               "We couldn't find this account.",
  invalid_reset_token:          'This password reset link is invalid or has expired.',

  // ─── Google OAuth ────────────────────────────────────────────────────
  google_email_not_verified:    "Your Google account's email isn't verified yet.",
  invalid_google_token:         "We couldn't verify your Google sign-in. Try again.",
  google_oauth_not_configured:  'Google sign-in is temporarily unavailable.',
  google_oauth_unreachable:     "Couldn't reach Google. Check your connection and try again.",
  google_oauth_exchange_failed: 'Google sign-in failed. Please try again.',
  google_oauth_missing_id_token:'Google sign-in failed. Please try again.',
  invalid_oauth_state:          'Sign-in session expired. Please try again.',
  google_signin_failed:         "Couldn't complete Google sign-in. Please try again.",

  // ─── Properties ──────────────────────────────────────────────────────
  property_not_found:           "We couldn't find this property.",
  property_already_exists:      'You already have a property with this name.',

  // ─── Floors ──────────────────────────────────────────────────────────
  floor_not_found:              "We couldn't find this floor.",
  floor_already_exists:         'A floor with this number already exists.',

  // ─── Units ───────────────────────────────────────────────────────────
  unit_not_found:               "We couldn't find this unit.",
  unit_already_exists:          'A unit with this number already exists on this floor.',

  // ─── Slots ───────────────────────────────────────────────────────────
  slot_not_found:               "We couldn't find this slot.",
  slot_already_exists:          'A slot with this number already exists in this unit.',
  slot_occupied:                'This slot is already taken. Vacate the current tenant first.',
  capacity_exceeded:            "This unit has no more space. Increase the unit's capacity to add another slot.",

  // ─── Tenants ─────────────────────────────────────────────────────────
  tenant_not_found:             "We couldn't find this tenant.",
  tenant_already_active:        'This tenant is already active.',
  tenant_already_exited:        'This tenant is already marked as exited.',
  phone_already_registered:     'A different active tenant is already using this phone number.',
  invalid_exit_date:            'Exit date must be on or after the join date.',

  // ─── Payments ────────────────────────────────────────────────────────
  payment_not_found:            "We couldn't find this payment.",
  payment_already_exists:       'A payment for this month is already recorded for this tenant.',
  payment_before_join:          "You can't record a payment for a month before the tenant joined.",
  payment_after_exit:           "You can't record a payment for a month after the tenant exited.",
  payment_date_in_future:       "Payment date can't be in the future.",

  // ─── Generic ─────────────────────────────────────────────────────────
  invalid_uuid:                 "We couldn't find that record.",
  validation_error:             'Please check the highlighted fields.',
  database_error:               'Something went wrong on our side. Please try again.',
  internal_error:               'Something went wrong on our side. Please try again.',
  not_found:                    "We couldn't find what you were looking for.",
};

/** Fallback when the backend returned no recognized code. */
export const STATUS_FALLBACKS: Record<number, string> = {
  400: 'That request was invalid. Please check and try again.',
  401: 'Your session expired. Please sign in again.',
  403: "You don't have permission for this.",
  404: "We couldn't find that.",
  409: 'That conflicts with existing data.',
  500: 'Server error. Please try again in a moment.',
  502: "Couldn't reach the server. Check your connection.",
  503: 'Service is temporarily unavailable. Please try again shortly.',
};

export const GENERIC_FALLBACK = 'Something went wrong. Please try again.';
