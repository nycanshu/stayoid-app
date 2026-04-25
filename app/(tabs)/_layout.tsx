import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { HouseIcon, BuildingsIcon, CreditCardIcon, ListIcon } from 'phosphor-react-native';
import type { Icon } from 'phosphor-react-native';

const TABS: { name: string; label: string; Icon: Icon }[] = [
  { name: 'index',      label: 'Home',       Icon: HouseIcon },
  { name: 'properties', label: 'Properties', Icon: BuildingsIcon },
  { name: 'payments',   label: 'Payments',   Icon: CreditCardIcon },
  { name: 'more',       label: 'More',       Icon: ListIcon },
];

function TabIcon({ label, Icon, focused }: { label: string; Icon: Icon; focused: boolean }) {
  const color = focused ? '#4F9D7E' : '#A3A3A3';
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#181818',
          borderTopWidth: 1,
          borderTopColor: '#272727',
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
              <TabIcon label={label} Icon={Icon} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
