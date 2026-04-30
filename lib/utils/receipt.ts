import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { Payment } from '../../types/payment';
import { APP_META } from '../constants/app-meta';
import { formatCurrency, formatLongDate, formatMonthYear } from './formatters';
import { getPropertyTypeLabels } from '../constants/property-type-meta';

const METHOD_LABELS: Record<Payment['payment_method'], string> = {
  CASH: 'Cash', UPI: 'UPI', BANK: 'Bank Transfer',
  CARD: 'Card', CHEQUE: 'Cheque', OTHER: 'Other',
};

const STATUS_LABELS: Record<Payment['payment_status'], string> = {
  PAID: 'Paid', PARTIAL: 'Partial', PENDING: 'Pending',
};

function escape(s: string | number | undefined | null): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildHtml(payment: Payment, ownerName: string): string {
  const propertyMeta = getPropertyTypeLabels(payment.property_type as 'PG' | 'FLAT');
  const issuedOn = formatLongDate(new Date().toISOString());

  const rows: [string, string][] = [
    ['Receipt no.', payment.id.slice(0, 8).toUpperCase()],
    ['Issued on', issuedOn],
    ['Tenant', payment.tenant_name],
    ['Phone', payment.tenant_phone],
    ['Property', payment.property_name],
    [`${propertyMeta.unitLabel} / ${propertyMeta.slotLabel}`,
     `${payment.unit_number} / ${payment.slot_number}`],
    ['Rent for', formatMonthYear(payment.payment_for_month, payment.payment_for_year)],
    ['Payment date', formatLongDate(payment.payment_date)],
    ['Method', METHOD_LABELS[payment.payment_method]],
    ['Status', STATUS_LABELS[payment.payment_status]],
  ];
  if (payment.transaction_id) rows.push(['Transaction ID', payment.transaction_id]);

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Payment Receipt</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; color: #1f1f1f; margin: 0; padding: 40px; }
  .header { border-bottom: 2px solid #4F9D7E; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
  .brand { font-size: 22px; font-weight: 700; color: #4F9D7E; letter-spacing: -0.5px; }
  .doc-title { font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 1.5px; }
  .amount-card { background: #F4FAF7; border: 1px solid #DCEFE5; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .amount-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 6px; }
  .amount-value { font-size: 32px; font-weight: 700; color: #1f1f1f; letter-spacing: -1px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 0; border-bottom: 1px solid #EFEFEF; font-size: 13px; }
  td.label { color: #666; width: 40%; }
  td.value { color: #1f1f1f; font-weight: 600; text-align: right; }
  tr:last-child td { border-bottom: none; }
  .notes { margin-top: 20px; background: #FAFAFA; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #444; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #EFEFEF; font-size: 11px; color: #999; text-align: center; line-height: 1.6; }
  .footer strong { color: #444; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="brand">${escape(ownerName || APP_META.name)}</div>
      <div style="font-size:11px;color:#999;margin-top:2px;">Powered by ${escape(APP_META.name)}</div>
    </div>
    <div class="doc-title">Payment Receipt</div>
  </div>

  <div class="amount-card">
    <div class="amount-label">Amount received</div>
    <div class="amount-value">${escape(formatCurrency(payment.amount))}</div>
  </div>

  <table>
    ${rows.map(([k, v]) => `<tr><td class="label">${escape(k)}</td><td class="value">${escape(v)}</td></tr>`).join('')}
  </table>

  ${payment.notes ? `<div class="notes"><strong>Notes:</strong> ${escape(payment.notes)}</div>` : ''}

  <div class="footer">
    Received from <strong>${escape(payment.tenant_name)}</strong> for ${escape(payment.property_name)}.<br/>
    This is a system-generated receipt and does not require a signature.
  </div>
</body></html>`;
}

export async function shareReceipt(payment: Payment, ownerName: string = ''): Promise<void> {
  const html = buildHtml(payment, ownerName);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Receipt — ${payment.tenant_name}`,
    UTI: 'com.adobe.pdf',
  });
}
