import {
  View, Text, TextInput, Pressable, FlatList, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import {
  XIcon, MagnifyingGlassIcon, CheckIcon, UsersIcon,
} from 'phosphor-react-native';
import { useTenants } from '../../lib/hooks/use-tenants';
import { getInitials, formatCurrency } from '../../lib/utils/formatters';
import { getPropertyTypeMeta } from '../../lib/constants/property-type-meta';
import { Skeleton } from '../ui/skeleton';
import type { AppColors } from '../../lib/theme/colors';
import type { Tenant } from '../../types/tenant';

interface TenantPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (tenant: Tenant) => void;
  selectedId?: string;
  colors: AppColors;
}

export function TenantPickerModal({
  visible, onClose, onSelect, selectedId, colors,
}: TenantPickerModalProps) {
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={{
            paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
            borderBottomWidth: 1, borderBottomColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{
                color: colors.foreground, fontSize: 18, fontFamily: 'Inter_600SemiBold',
                letterSpacing: -0.3,
              }}>
                Select Tenant
              </Text>
              <Pressable
                onPress={handleClose}
                android_ripple={null}
                hitSlop={8}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: colors.mutedBg,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <XIcon size={16} color={colors.foreground} weight="bold" />
              </Pressable>
            </View>

            {/* Search */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: colors.card,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 12, paddingHorizontal: 14, height: 44,
            }}>
              <MagnifyingGlassIcon size={16} color={colors.mutedFg} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, phone, room, property"
                placeholderTextColor={colors.mutedFg}
                style={{
                  flex: 1, color: colors.foreground,
                  fontSize: 13, fontFamily: 'Inter_400Regular', padding: 0,
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')} hitSlop={8} android_ripple={null}>
                  <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                    Clear
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              const typeMeta = getPropertyTypeMeta(item.property_type, colors);
              return (
                <Pressable
                  onPress={() => { onSelect(item); handleClose(); }}
                  android_ripple={null}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: 12, padding: 12,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}
                >
                  <View style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>
                      {getInitials(item.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text
                        numberOfLines={1}
                        style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', flexShrink: 1 }}
                      >
                        {item.name}
                      </Text>
                      <View style={{
                        backgroundColor: typeMeta.iconBg, borderRadius: 4,
                        paddingHorizontal: 5, paddingVertical: 1,
                      }}>
                        <Text style={{ color: typeMeta.iconColor, fontSize: 9, fontFamily: 'Inter_600SemiBold' }}>
                          {typeMeta.shortLabel}
                        </Text>
                      </View>
                    </View>
                    <Text
                      numberOfLines={1}
                      style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 }}
                    >
                      {item.property_name} · {item.unit_number} · {item.slot_number}
                    </Text>
                    <Text style={{ color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                      {formatCurrency(item.monthly_rent)}<Text style={{ color: colors.mutedFg, fontFamily: 'Inter_400Regular' }}>/mo</Text>
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={{
                      width: 22, height: 22, borderRadius: 11,
                      backgroundColor: colors.primary,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckIcon size={12} color="#fff" weight="bold" />
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              isLoading ? (
                <View style={{ gap: 8 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={{
                      backgroundColor: colors.card,
                      borderWidth: 1, borderColor: colors.border,
                      borderRadius: 12, padding: 12,
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}>
                      <Skeleton width={38} height={38} radius={19} />
                      <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width="60%" height={12} />
                        <Skeleton width="80%" height={10} />
                        <Skeleton width="40%" height={10} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 16,
                    backgroundColor: colors.mutedBg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                  }}>
                    <UsersIcon size={24} color={colors.mutedFg} weight="duotone" />
                  </View>
                  <Text style={{
                    color: colors.foreground, fontSize: 14,
                    fontFamily: 'Inter_600SemiBold', marginBottom: 4,
                  }}>
                    {query ? 'No matches' : 'No active tenants'}
                  </Text>
                  <Text style={{
                    color: colors.mutedFg, fontSize: 12,
                    fontFamily: 'Inter_400Regular', textAlign: 'center',
                  }}>
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
