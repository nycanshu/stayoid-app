import { View, Text, Pressable } from 'react-native';
import { BuildingsIcon, CaretDownIcon, CheckCircleIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { useProperties } from '../../lib/hooks/use-properties';
import { useActionSheet } from '../ui/ActionSheet';
import { THEME } from '../../lib/theme';

interface PropertyFilterBarProps {
  /** Current selected property id, or undefined for "All Properties". */
  value?: string;
  onChange: (propertyId: string | undefined) => void;
  /** Override label shown when nothing is selected. */
  allLabel?: string;
}

export function PropertyFilterBar({ value, onChange, allLabel = 'All Properties' }: PropertyFilterBarProps) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const { show: showActionSheet } = useActionSheet();
  const { data: properties } = useProperties();

  const selected = value ? properties?.find((p) => p.id === value) : undefined;
  const label = selected?.name ?? allLabel;
  const subtitle = selected
    ? `${selected.address}`
    : `${properties?.length ?? 0} ${(properties?.length ?? 0) === 1 ? 'property' : 'properties'}`;

  const openPicker = () => {
    const list = properties ?? [];
    showActionSheet({
      title: 'Filter by property',
      message: 'Choose a property to narrow the list, or All to see everything.',
      options: [
        {
          label: allLabel,
          description: `${list.length} ${list.length === 1 ? 'property' : 'properties'}`,
          selected: !value,
          onPress: () => onChange(undefined),
        },
        ...list.map((p) => ({
          label: p.name,
          description: p.address,
          selected: value === p.id,
          onPress: () => onChange(p.id),
        })),
      ],
    });
  };

  return (
    <Pressable
      onPress={openPicker}
      android_ripple={null}
      className="flex-row items-center gap-3 bg-card border border-border rounded-xl p-3.5"
    >
      <View className={value ? 'size-9 rounded-[10px] bg-primary-bg items-center justify-center' : 'size-9 rounded-[10px] bg-muted items-center justify-center'}>
        {value
          ? <CheckCircleIcon size={16} color={palette.primary} weight="fill" />
          : <BuildingsIcon size={16} color={palette.mutedForeground} weight="duotone" />}
      </View>
      <View className="flex-1 min-w-0">
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {value ? 'Filtered by property' : 'Filter by property'}
        </Text>
        <Text
          numberOfLines={1}
          className="text-foreground text-[13px] mt-0.5"
          style={{ fontFamily: 'Inter_600SemiBold' }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            numberOfLines={1}
            className="text-muted-foreground text-[11px] mt-px"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <CaretDownIcon size={14} color={palette.mutedForeground} />
    </Pressable>
  );
}
