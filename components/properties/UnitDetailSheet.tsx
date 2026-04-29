import { useEffect, useState } from 'react';
import {
  Modal, View, Pressable, ScrollView, Dimensions, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  runOnJS, Easing,
} from 'react-native-reanimated';
import {
  XIcon, PencilIcon, DoorOpenIcon, BedIcon, PlusIcon, UsersIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Text } from '@/components/ui/text';
import { UnitFormModal } from './UnitFormModal';
import { SlotFormModal } from './SlotFormModal';
import { OccupancyBar } from './OccupancyBar';
import { formatCurrency, formatFloorName, getInitials } from '@/lib/utils/formatters';
import { getPropertyTypeLabels } from '@/lib/constants/property-type-meta';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { Slot, Unit, PropertyType } from '@/types/property';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.88;

interface UnitDetailSheetProps {
  visible: boolean;
  unit: Unit | null;
  slots: Slot[];
  propertyId: string;
  floorId: string;
  propertyType?: PropertyType;
  propertyName?: string;
  propertySlug?: string;
  floorNumber?: number;
  onClose: () => void;
}

export function UnitDetailSheet({
  visible, unit, slots, propertyId, floorId, propertyType,
  propertyName, propertySlug, floorNumber, onClose,
}: UnitDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const labels = getPropertyTypeLabels(propertyType);

  const backdrop = useSharedValue(0);
  const translate = useSharedValue(SCREEN_H);
  const [mounted, setMounted] = useState(visible);

  const [editUnitOpen, setEditUnitOpen] = useState(false);
  const [slotFormOpen, setSlotFormOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Haptics.selectionAsync();
      requestAnimationFrame(() => {
        backdrop.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
        translate.value = withSpring(0, { damping: 24, stiffness: 240, mass: 0.6 });
      });
    } else if (mounted) {
      backdrop.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
      translate.value = withTiming(SCREEN_H, { duration: 220, easing: Easing.in(Easing.quad) },
        (done) => { if (done) runOnJS(setMounted)(false); });
    }
  }, [visible, backdrop, translate, mounted]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value * 0.6 }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translate.value }] }));

  const totalSlots = slots.length;
  const occupied = slots.filter((s) => s.is_occupied).length;
  const occupancyPct = totalSlots > 0 ? (occupied / totalSlots) * 100 : 0;
  const potentialRent = slots.reduce((sum, s) => sum + Number(s.monthly_rent), 0);
  const collectedRent = slots.reduce(
    (sum, s) => sum + (s.is_occupied ? Number(s.monthly_rent) : 0),
    0,
  );

  const sortedSlots = [...slots].sort(
    (a, b) => a.slot_number.localeCompare(b.slot_number, undefined, { numeric: true }),
  );

  const handleSlotPress = (s: Slot) => {
    onClose();
    setTimeout(() => {
      if (s.active_tenant?.slug) {
        router.push(`/(tabs)/tenants/${s.active_tenant.slug}` as never);
      } else if (propertySlug) {
        router.push(`/tenants/new?property=${propertySlug}` as never);
      }
    }, 240);
  };

  return (
    <Modal
      transparent
      visible={mounted}
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdropStyle]}
        />
      </Pressable>

      <Animated.View
        style={[
          {
            position: 'absolute', left: 0, right: 0, bottom: 0,
            backgroundColor: palette.background,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderTopWidth: 1, borderColor: palette.border,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
            maxHeight: SHEET_MAX_H,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.35,
            shadowRadius: 18,
            elevation: 30,
          },
          sheetStyle,
        ]}
      >
        <View className="items-center pt-3 pb-2">
          <View className="w-11 h-[5px] rounded-[3px] bg-muted-foreground opacity-40" />
        </View>

        <View className="flex-row items-start gap-3 px-4 pt-2 pb-3 border-b border-border">
          <View className="size-11 rounded-[10px] bg-info-bg items-center justify-center">
            <DoorOpenIcon size={20} color={palette.info} weight="duotone" />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              numberOfLines={1}
              className="text-foreground text-[17px] tracking-tight"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {unit ? `${labels.unitLabel} ${unit.unit_number}` : ''}
              {unit?.name ? ` · ${unit.name}` : ''}
            </Text>
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-[12px] mt-0.5"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {propertyName}
              {floorNumber !== undefined ? ` · ${formatFloorName(floorNumber)}` : ''}
            </Text>
          </View>
          {unit && (
            <Pressable
              onPress={() => setEditUnitOpen(true)}
              android_ripple={null}
              hitSlop={6}
              className="size-9 rounded-[10px] border border-border bg-card items-center justify-center"
            >
              <PencilIcon size={14} color={palette.foreground} />
            </Pressable>
          )}
          <Pressable
            onPress={onClose}
            android_ripple={null}
            hitSlop={6}
            className="size-9 rounded-[10px] border border-border bg-card items-center justify-center"
          >
            <XIcon size={14} color={palette.foreground} weight="bold" />
          </Pressable>
        </View>

        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        >
          {unit && (
            <View className="bg-card border border-border rounded-xl overflow-hidden mb-3">
              <View className="p-3.5 border-b border-border">
                <Text
                  className="text-muted-foreground text-[11px] mb-1"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Occupancy
                </Text>
                <Text
                  className="text-foreground text-[22px] leading-[26px] mb-2"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {Math.round(occupancyPct)}%
                </Text>
                <OccupancyBar occupied={occupied} total={totalSlots} />
                <Text
                  className="text-muted-foreground text-[11px] mt-1.5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {totalSlots === 0
                    ? `Capacity ${unit.capacity ?? '—'} · no ${labels.slotLabelPlural.toLowerCase()} yet`
                    : `${occupied} of ${totalSlots} ${labels.slotLabelPlural.toLowerCase()} occupied · capacity ${unit.capacity}`}
                </Text>
              </View>
              <View className="flex-row">
                <View className="flex-1 p-3.5 border-r border-border">
                  <Text
                    className="text-muted-foreground text-[11px] mb-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Collecting
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-foreground text-[15px] leading-5"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {formatCurrency(collectedRent)}
                  </Text>
                </View>
                <View className="flex-1 p-3.5">
                  <Text
                    className="text-muted-foreground text-[11px] mb-1"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    Potential
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-foreground text-[15px] leading-5"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {formatCurrency(potentialRent)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-3">
            <Text
              className="text-foreground text-sm"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {labels.slotLabelPlural}
            </Text>
            <Pressable
              onPress={() => setSlotFormOpen(true)}
              android_ripple={null}
              hitSlop={6}
              className="flex-row items-center gap-1 bg-primary rounded-[10px] px-2.5 py-1.5"
            >
              <PlusIcon size={12} color="#fff" weight="bold" />
              <Text
                className="text-white text-xs"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Add {labels.slotLabel}
              </Text>
            </Pressable>
          </View>

          {sortedSlots.length === 0 ? (
            <View className="bg-card border border-border rounded-xl p-7 items-center">
              <View className="size-[52px] rounded-2xl bg-primary-bg items-center justify-center mb-3">
                <BedIcon size={24} color={palette.primary} weight="duotone" />
              </View>
              <Text
                className="text-foreground text-sm mb-1 text-center"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                No {labels.slotLabelPlural.toLowerCase()} yet
              </Text>
              <Text
                className="text-muted-foreground text-xs text-center leading-[18px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Add a {labels.slotLabel.toLowerCase()} to start placing tenants here.
              </Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {sortedSlots.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => handleSlotPress(s)}
                  android_ripple={null}
                  className="bg-card border border-border rounded-xl p-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={cn(
                        'size-11 rounded-[10px] items-center justify-center',
                        s.is_occupied ? 'bg-muted' : 'bg-primary-bg',
                      )}
                    >
                      {s.active_tenant ? (
                        <Text
                          className="text-foreground text-[13px]"
                          style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                          {getInitials(s.active_tenant.name)}
                        </Text>
                      ) : (
                        <BedIcon size={18} color={palette.primary} weight="duotone" />
                      )}
                    </View>
                    <View className="flex-1 min-w-0">
                      <Text
                        numberOfLines={1}
                        className="text-foreground text-sm shrink"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                      >
                        {s.active_tenant?.name ?? `${labels.slotLabel} ${s.slot_number}`}
                      </Text>
                      <Text
                        className="text-muted-foreground text-[11px] mt-0.5"
                        style={{ fontFamily: 'Inter_400Regular' }}
                      >
                        {labels.slotLabel} {s.slot_number}
                        {Number(s.monthly_rent) > 0
                          ? ` · ${formatCurrency(s.monthly_rent)}/mo`
                          : ' · rent not set'}
                      </Text>
                      {s.active_tenant?.phone && (
                        <View className="flex-row items-center gap-0.5 mt-0.5">
                          <UsersIcon size={11} color={palette.mutedForeground} />
                          <Text
                            className="text-muted-foreground text-[11px]"
                            style={{ fontFamily: 'Inter_400Regular' }}
                          >
                            {s.active_tenant.phone}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {unit && (
        <>
          <UnitFormModal
            visible={editUnitOpen}
            propertyId={propertyId}
            floorId={floorId}
            propertyType={propertyType}
            unit={unit}
            onClose={() => setEditUnitOpen(false)}
          />
          <SlotFormModal
            visible={slotFormOpen}
            propertyId={propertyId}
            floorId={floorId}
            unitId={unit.id}
            unitLabel={`${labels.unitLabel} ${unit.unit_number}`}
            propertyType={propertyType}
            onClose={() => setSlotFormOpen(false)}
          />
        </>
      )}
    </Modal>
  );
}
