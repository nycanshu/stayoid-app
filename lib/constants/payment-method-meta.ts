import {
  MoneyIcon, DeviceMobileIcon, BankIcon, CreditCardIcon,
  ScrollIcon, DotsThreeIcon,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import type { AppColors } from '../theme/colors';
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

/** Common color tokens used by both helpers. AppColors and THEME palette
 *  use different field names for muted + destructive, so we adapt them at the
 *  helper boundary via paletteFromScheme(). */
type Tokens = {
  success: string;
  successBg: string;
  info: string;
  infoBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  mutedFg: string;
  mutedBg: string;
};

function tokensFromAppColors(c: AppColors): Tokens {
  return {
    success: c.success, successBg: c.successBg,
    info: c.info, infoBg: c.infoBg,
    warning: c.warning, warningBg: c.warningBg,
    danger: c.danger, dangerBg: c.dangerBg,
    mutedFg: c.mutedFg, mutedBg: c.mutedBg,
  };
}

function tokensFromScheme(scheme: 'light' | 'dark'): Tokens {
  const t = THEME[scheme];
  return {
    success: t.success, successBg: t.successBg,
    info: t.info, infoBg: t.infoBg,
    warning: t.warning, warningBg: t.warningBg,
    danger: t.destructive, dangerBg: t.destructiveBg,
    mutedFg: t.mutedForeground, mutedBg: t.muted,
  };
}

function methodMetaFromTokens(method: PaymentMethod, t: Tokens): PaymentMethodMeta {
  switch (method) {
    case 'CASH':   return { label: 'Cash',   Icon: MoneyIcon,        color: t.success, bg: t.successBg };
    case 'UPI':    return { label: 'UPI',    Icon: DeviceMobileIcon, color: t.info,    bg: t.infoBg    };
    case 'BANK':   return { label: 'Bank',   Icon: BankIcon,         color: t.warning, bg: t.warningBg };
    case 'CARD':   return { label: 'Card',   Icon: CreditCardIcon,   color: t.danger,  bg: t.dangerBg  };
    case 'CHEQUE': return { label: 'Cheque', Icon: ScrollIcon,       color: t.mutedFg, bg: t.mutedBg   };
    default:       return { label: 'Other',  Icon: DotsThreeIcon,    color: t.mutedFg, bg: t.mutedBg   };
  }
}

function statusMetaFromTokens(status: PaymentStatus, t: Tokens): PaymentStatusMeta {
  if (status === 'PAID')    return { label: 'Paid',    color: t.success, bg: t.successBg };
  if (status === 'PARTIAL') return { label: 'Partial', color: t.warning, bg: t.warningBg };
  return                          { label: 'Pending', color: t.danger,  bg: t.dangerBg  };
}

export function getPaymentMethodMeta(method: PaymentMethod, colors: AppColors): PaymentMethodMeta {
  return methodMetaFromTokens(method, tokensFromAppColors(colors));
}

export function getPaymentStatusMeta(status: PaymentStatus, colors: AppColors): PaymentStatusMeta {
  return statusMetaFromTokens(status, tokensFromAppColors(colors));
}

export function getPaymentMethodMetaScheme(method: PaymentMethod, scheme: 'light' | 'dark'): PaymentMethodMeta {
  return methodMetaFromTokens(method, tokensFromScheme(scheme));
}

export function getPaymentStatusMetaScheme(status: PaymentStatus, scheme: 'light' | 'dark'): PaymentStatusMeta {
  return statusMetaFromTokens(status, tokensFromScheme(scheme));
}

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK', 'CARD', 'CHEQUE', 'OTHER'];
