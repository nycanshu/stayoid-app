import {
  createContext, useCallback, useContext, useState, type ReactNode,
} from 'react';
import { ReceiptIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { toast } from 'sonner-native';
import { FormSheet } from '../ui/FormSheet';
import { PaymentForm } from './PaymentForm';
import { shareReceipt } from '@/lib/utils/receipt';
import type { Payment } from '@/types/payment';
import { THEME } from '@/lib/theme';

interface OpenArgs {
  /** Pre-select a tenant by slug; otherwise the form shows the tenant picker. */
  tenantSlug?: string;
}

interface Ctx {
  open: (args?: OpenArgs) => void;
  close: () => void;
}

const RecordPaymentSheetContext = createContext<Ctx | null>(null);

export function useRecordPaymentSheet() {
  const ctx = useContext(RecordPaymentSheetContext);
  if (!ctx) {
    throw new Error('useRecordPaymentSheet must be used inside <RecordPaymentSheetProvider>');
  }
  return ctx;
}

export function RecordPaymentSheetProvider({ children }: { children: ReactNode }) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const [state, setState] = useState<{ visible: boolean; tenantSlug?: string }>(
    { visible: false },
  );

  const open = useCallback((args?: OpenArgs) => {
    setState({ visible: true, tenantSlug: args?.tenantSlug });
  }, []);

  const close = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  const handleSuccess = useCallback((payment: Payment) => {
    close();
    toast.success(`Payment recorded for ${payment.tenant_name}`, {
      duration: 8000,
      action: {
        label: 'Share receipt',
        onClick: () => {
          shareReceipt(payment).catch(() => {
            toast.error('Could not generate receipt. Please try again.');
          });
        },
      },
    });
  }, [close]);

  return (
    <RecordPaymentSheetContext.Provider value={{ open, close }}>
      {children}
      <FormSheet
        visible={state.visible}
        onClose={close}
        title="Record Payment"
        subtitle={
          state.tenantSlug
            ? 'Tenant pre-selected — review and submit'
            : 'Select a tenant and confirm the details'
        }
        Icon={ReceiptIcon}
        iconBg={palette.successBg}
        iconColor={palette.success}
      >
        <PaymentForm
          preselectedTenantSlug={state.tenantSlug}
          onSuccess={handleSuccess}
          onCancel={close}
        />
      </FormSheet>
    </RecordPaymentSheetContext.Provider>
  );
}
