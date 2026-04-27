import {
  View, Text, TextInput, Pressable, FlatList, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import {
  XIcon, MagnifyingGlassIcon, CheckIcon, UsersIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useTenants } from '../../lib/hooks/use-tenants';
import { getInitials, formatCurrency } from '../../lib/utils/formatters';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { Skeleton } from '../ui/skeleton';
import { THEME } from '../../lib/theme';
import { cn } from '../../lib/utils';
import type { Tenant } from '../../types/tenant';

interface TenantPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (tenant: Tenant) => void;
  selectedId?: string;
}

export function TenantPickerModal({
  visible, onClose, onSelect, selectedId,
}: TenantPickerModalProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const [query, setQuery] = useState('');
  const { data: tenants, isLoading } = useTenants({ active: true, page_size: 100 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenants ?? [];
    return (tenants ?? []).filter((t) => {
      const corpus = [
        t.name, t.phone, t.property_name,
        t.unit_number, t.slot_number, t.property_type,
      ].join(' ').toLowerCase();
      return corpus.includes(q);
    });
  }, [tenants, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="px-4 pt-2 pb-3 border-b border-border">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-foreground text-lg tracking-tight"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Select Tenant
              </Text>
              <Pressable
                onPress={handleClose}
                android_ripple={null}
                hitSlop={8}
                className="size-8 rounded-lg bg-muted items-center justify-center"
              >
                <XIcon size={16} color={palette.foreground} weight="bold" />
              </Pressable>
            </View>

            <View className="flex-row items-center gap-2.5 bg-card border border-border rounded-xl px-3.5 h-11">
              <MagnifyingGlassIcon size={16} color={palette.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, phone, room, property"
                placeholderTextColor={palette.mutedForeground}
                className="flex-1 text-foreground text-[13px] p-0"
                style={{ fontFamily: 'Inter_400Regular' }}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8} android_ripple={null}>
                  <Text
                    className="text-muted-foreground text-xs"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              const typeMeta = getPropertyTypeMeta(item.property_type, palette);
              return (
                <Pressable
                  onPress={() => { onSelect(item); handleClose(); }}
                  android_ripple={null}
                  className={cn(
                    'bg-card border rounded-xl p-3 flex-row items-center gap-3',
                    isSelected ? 'border-primary' : 'border-border',
                  )}
                >
                  <View className="size-[38px] rounded-full bg-muted items-center justify-center">
                    <Text
                      className="text-foreground text-xs"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {getInitials(item.name)}
                    </Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Text
                        numberOfLines={1}
                        className="text-foreground text-sm shrink"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                      >
                        {item.name}
                      </Text>
                      <View
                        style={{ backgroundColor: typeMeta.iconBg }}
                        className="rounded px-1 py-px"
                      >
                        <Text
                          style={{ color: typeMeta.iconColor, fontFamily: 'Inter_600SemiBold' }}
                          className="text-[9px]"
                        >
                          {typeMeta.shortLabel}
                        </Text>
                      </View>
                    </View>
                    <Text
                      numberOfLines={1}
                      className="text-muted-foreground text-[11px] mb-0.5"
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {item.property_name} · {item.unit_number} · {item.slot_number}
                    </Text>
                    <Text
                      className="text-foreground text-[11px]"
                      style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                      {formatCurrency(item.monthly_rent)}
                      <Text
                        className="text-muted-foreground"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        /mo
                      </Text>
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="size-[22px] rounded-full bg-primary items-center justify-center">
                      <CheckIcon size={12} color="#fff" weight="bold" />
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              isLoading ? (
                <View className="gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      className="bg-card border border-border rounded-xl p-3 flex-row items-center gap-3"
                    >
                      <Skeleton width={38} height={38} radius={19} />
                      <View className="flex-1 gap-1.5">
                        <Skeleton width="60%" height={12} />
                        <Skeleton width="80%" height={10} />
                        <Skeleton width="40%" height={10} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center pt-[60px]">
                  <View className="size-[52px] rounded-2xl bg-muted items-center justify-center mb-3">
                    <UsersIcon size={24} color={palette.mutedForeground} weight="duotone" />
                  </View>
                  <Text
                    className="text-foreground text-sm mb-1"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {query ? 'No matches' : 'No active tenants'}
                  </Text>
                  <Text
                    className="text-muted-foreground text-xs text-center"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {query ? 'Try a different search term.' : 'Add tenants from the Tenants tab first.'}
                  </Text>
                </View>
              )
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
