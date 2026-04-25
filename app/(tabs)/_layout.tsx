import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { colors } from '../../lib/theme/tokens';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Properties: '🏢', Payments: '💳', More: '☰',
  };
  return (
    <View className="items-center gap-0.5">
      <Text style={{ fontSize: 20 }}>{icons[label]}</Text>
      <Text style={{
        fontSize: 11,
        color: focused ? colors.primary : colors.mutedFg.dark,
        fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_400Regular',
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
          backgroundColor: colors.card.dark,
          borderTopColor: colors.border.dark,
          height: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Properties" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Payments" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="More" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
