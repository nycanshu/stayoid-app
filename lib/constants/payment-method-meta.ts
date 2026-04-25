import {
  MoneyIcon, DeviceMobileIcon, BankIcon, CreditCardIcon,
  ScrollIcon, DotsThreeIcon,
} from 'phosphor-react-native';
import type { ComponentType } from 'react';
import type { AppColors } from '../theme/colors';
import type { PaymentMethod, PaymentStatus } from '../../types/payment';

interface PaymentMethodMeta {
  label: string;
  Icon: ComponentType<{ size: number; color: string; weight?: any }>;
  color: string;
  bg: string;
}

export function getPaymentMethodMeta(method: PaymentMethod, colors: AppColors): PaymentMethodMeta {
  switch (method) {
    case 'CASH':   return { label: 'Cash',   Icon: MoneyIcon,        color: colors.success, bg: colors.successBg };
    case 'UPI':    return { label: 'UPI',    Icon: DeviceMobileIcon, color: colors.info,    bg: colors.infoBg    };
    case 'BANK':   return { label: 'Bank',   Icon: BankIcon,         color: colors.warning, bg: colors.warningBg };
    case 'CARD':   return { label: 'Card',   Icon: CreditCardIcon,   color: colors.danger,  bg: colors.dangerBg  };
    case 'CHEQUE': return { label: 'Cheque', Icon: ScrollIcon,       color: colors.mutedFg, bg: colors.mutedBg   };
    default:       return { label: 'Other',  Icon: DotsThreeIcon,    color: colors.mutedFg, bg: colors.mutedBg   };
  }
}

interface PaymentStatusMeta {
  label: string;
  color: string;
  bg: string;
}

export function getPaymentStatusMeta(status: PaymentStatus, colors: AppColors): PaymentStatusMeta {
  if (status === 'PAID')    return { label: 'Paid',    color: colors.success, bg: colors.successBg };
  if (status === 'PARTIAL') return { label: 'Partial', color: colors.warning, bg: colors.warningBg };
  return                          { label: 'Pending', color: colors.danger,  bg: colors.dangerBg  };
}

export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'UPI', 'BANK', 'CARD', 'CHEQUE', 'OTHER'];
