import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';

export interface ConfirmConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface Ctx {
  confirm: (config: ConfirmConfig) => void;
}

const ConfirmDialogContext = createContext<Ctx | null>(null);

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog must be used inside <ConfirmDialogProvider>');
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);
  const [busy, setBusy] = useState(false);

  const open = !!config;

  const close = useCallback(() => {
    setConfig(null);
    setBusy(false);
  }, []);

  const show = useCallback((c: ConfirmConfig) => {
    setBusy(false);
    setConfig(c);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!config || busy) return;
    if (config.destructive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.selectionAsync();
    }
    setBusy(true);
    try {
      await config.onConfirm();
      close();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setBusy(false);
    }
  }, [config, busy, close]);

  const isDestructive = !!config?.destructive;
  const confirmLabel = config?.confirmLabel ?? (isDestructive ? 'Delete' : 'Confirm');
  const cancelLabel = config?.cancelLabel ?? 'Cancel';

  return (
    <ConfirmDialogContext.Provider value={{ confirm: show }}>
      {children}

      <AlertDialog open={open} onOpenChange={(next) => !next && !busy && close()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            {config?.message && (
              <AlertDialogDescription>{config.message}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              <Text>{cancelLabel}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={handleConfirm}
              disabled={busy}
              className={isDestructive ? 'bg-destructive' : undefined}
            >
              {busy && <ActivityIndicator size="small" color="#fff" />}
              <Text className={isDestructive ? 'text-destructive-foreground' : undefined}>
                {busy ? 'Working…' : confirmLabel}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmDialogContext.Provider>
  );
}
