import { formatCurrency, formatMonthYear } from '../utils/formatters';

/**
 * Message templates kept in one place so admins get consistent, polite copy.
 * All templates use first-person-from-admin voice, in clear English.
 */

interface RentReminderArgs {
  tenantName: string;
  amount: number | string;
  month: number;
  year: number;
  propertyName: string;
}

export function rentReminderMessage({
  tenantName, amount, month, year, propertyName,
}: RentReminderArgs): string {
  return [
    `Hi ${tenantName},`,
    '',
    `This is a friendly reminder — your rent of ${formatCurrency(amount)} for ${formatMonthYear(month, year)} at ${propertyName} is pending.`,
    '',
    'Please pay at your earliest convenience. Let me know if there\'s anything I should know.',
    '',
    'Thanks!',
  ].join('\n');
}

interface PaymentConfirmationArgs {
  tenantName: string;
  amount: number | string;
  month: number;
  year: number;
  method: string;
  propertyName: string;
}

export function paymentConfirmationMessage({
  tenantName, amount, month, year, method, propertyName,
}: PaymentConfirmationArgs): string {
  return [
    `Hi ${tenantName},`,
    '',
    `Payment of ${formatCurrency(amount)} received for ${formatMonthYear(month, year)} via ${method}. Thank you!`,
    '',
    `— ${propertyName}`,
  ].join('\n');
}

interface WelcomeArgs {
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  slotNumber: string;
  rent: number | string;
  unitLabel: string;
  slotLabel: string;
}

export function welcomeMessage({
  tenantName, propertyName, unitNumber, slotNumber, rent,
  unitLabel, slotLabel,
}: WelcomeArgs): string {
  return [
    `Welcome to ${propertyName}, ${tenantName}!`,
    '',
    `Your ${unitLabel.toLowerCase()}: ${unitNumber}`,
    `Your ${slotLabel.toLowerCase()}: ${slotNumber}`,
    `Monthly rent: ${formatCurrency(rent)}`,
    '',
    'Reach out anytime if you have any questions. Glad to have you here!',
  ].join('\n');
}

/**
 * Generic "open WhatsApp / SMS" labels — used in ActionSheet menus.
 */
export const MESSAGE_ACTION_LABELS = {
  whatsapp: 'Send WhatsApp',
  sms: 'Send SMS',
  remind: 'Send Reminder',
} as const;
