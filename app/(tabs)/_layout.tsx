import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { HouseIcon, BuildingsIcon, CreditCardIcon, GearSixIcon } from 'phosphor-react-native';
import type { Icon } from 'phosphor-react-native';
import { useColors } from '../../lib/hooks/use-colors';

const TABS: { name: string; label: string; Icon: Icon }[] = [
  { name: 'index',      label: 'Dashboard',  Icon: HouseIcon },
  { name: 'properties', label: 'Properties', Icon: BuildingsIcon },
  { name: 'payments',   label: 'Payments',   Icon: CreditCardIcon },
  { name: 'settings',   label: 'Settings',   Icon: GearSixIcon },
];

function TabIcon({ label, Icon, focused, colors }: {
  label: string;
  Icon: Icon;
  focused: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const color = focused ? colors.primary : colors.mutedFg;
  return (
    <View style={{ alignItems: 'center', gap: 3, paddingTop: 4 }}>
      <Icon size={22} color={color} weight={focused ? 'fill' : 'regular'} />
      <Text style={{
        fontSize: 10,
        color,
        fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_400Regular',
        letterSpacing: 0.2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      {TABS.map(({ name, label, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon label={label} Icon={Icon} focused={focused} colors={colors} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
