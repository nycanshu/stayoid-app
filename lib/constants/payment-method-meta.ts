import {
  MoneyIcon, DeviceMobileIcon, BankIcon, CreditCardIcon,
  ScrollIcon, DotsThreeIcon,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import { THEME } from '../theme';
import type { PaymentMethod, PaymentStatus } from '../../types/payment';

interface PaymentMethodMeta {
  label: string;
  Icon: ComponentType<{ size: number; color: string; weight?: any }>;
  color: string;
  bg: string;
}

interface PaymentStatusMeta {
  label: string;
  color: string;
  bg: string;
}

export function getPaymentMethodMetaScheme(method: PaymentMethod, scheme: 'light' | 'dark'): PaymentMethodMeta {
  const t = THEME[scheme];
  switch (method) {
    case 'CASH':   return { label: 'Cash',   Icon: MoneyIcon,        color: t.success,     bg: t.successBg     };
    case 'UPI':    return { label: 'UPI',    Icon: DeviceMobileIcon, color: t.info,        bg: t.infoBg        };
    case 'BANK':   return { label: 'Bank',   Icon: BankIcon,         color: t.warning,     bg: t.warningBg     };
    case 'CARD':   return { label: 'Card',   Icon: CreditCardIcon,   color: t.destructive, bg: t.destructiveBg };
    case 'CHEQUE': return { label: 'Cheque', Icon: ScrollIcon,       color: t.mutedForeground, bg: t.muted     };
    default:       return { label: 'Other',  Icon: DotsThreeIcon,    color: t.mutedForeground, bg: t.muted     };
  }
}

export function getPaymentStatusMetaScheme(status: PaymentStatus, scheme: 'light' | 'dark'): PaymentStatusMeta {
  const t = THEME[scheme];
  if (status === 'PAID')    return { label: 'Paid',    color: t.success,     bg: t.successBg     };
  if (status === 'PARTIAL') return { label: 'Partial', color: t.warning,     bg: t.warningBg     };
  return                          { label: 'Pending', color: t.destructive, bg: t.destructiveBg };
}

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK', 'CARD', 'CHEQUE', 'OTHER'];
