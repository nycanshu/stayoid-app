import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheckIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'Account information (name, email, phone), the property/tenant/payment records you enter, and basic device info to keep the app running. We do not collect contacts, photos, or location data.',
  },
  {
    title: 'How we use it',
    body: 'Your data powers Stayoid features — dashboards, tenant lookups, payment summaries. We do not sell your data, ever. Aggregated, anonymised statistics may be used to improve the product.',
  },
  {
    title: 'How we store it',
    body: 'Data is stored on managed cloud servers with encryption at rest and in transit. Access tokens on your device are kept in secure storage (Keychain on iOS, Keystore on Android).',
  },
  {
    title: 'Who can access it',
    body: 'Only you and the small Stayoid engineering team can access your data, and the team only does so when you explicitly request support or to investigate incidents. We log every internal access.',
  },
  {
    title: 'Third-party services',
    body: 'We use a small set of trusted providers — cloud hosting, error monitoring, and analytics for crash reports. Each provider receives the minimum data needed and is bound by data protection agreements.',
  },
  {
    title: 'Your controls',
    body: 'Edit your profile from Settings → Profile. Change appearance preferences any time. Request a full export or permanent deletion via Settings → Delete account — we process these manually within 48 hours.',
  },
  {
    title: 'Children',
    body: "Stayoid is intended for adults managing rental businesses. We do not knowingly collect data from anyone under 18. If you believe we have, contact us and we'll delete it.",
  },
  {
    title: 'Changes to this policy',
    body: 'We update this policy as the product evolves. Material changes are surfaced in-app. Continued use of Stayoid after a change means you accept the updated policy.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions, requests, or to report a concern email hello.stayoid@gmail.com. We respond within two business days.',
  },
];

export default function PrivacyScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Entrance trigger={1} style={{ marginBottom: 16 }}>
          <Text
            className="text-muted-foreground text-[13px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            What we collect, why, and how to control it
          </Text>
        </Entrance>

        <Entrance trigger={1} delay={40}>
          <View
            style={{
              backgroundColor: `${palette.success}10`,
              borderColor: `${palette.success}33`,
            }}
            className="border rounded-xl p-3.5 flex-row items-center gap-3 mb-4"
          >
            <View className="size-9 rounded-[10px] bg-success-bg items-center justify-center">
              <ShieldCheckIcon size={18} color={palette.success} weight="fill" />
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground text-[13px] mb-0.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Your data stays yours
              </Text>
              <Text
                className="text-muted-foreground text-xs leading-[17px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                We never sell your data. Encrypted in transit and at rest.
              </Text>
            </View>
          </View>
        </Entrance>

        {SECTIONS.map((s, i) => (
          <Entrance key={s.title} trigger={1} delay={80 + i * 30}>
            <View className="bg-card border border-border rounded-xl p-4 mb-2.5">
              <Text
                className="text-foreground text-sm mb-1.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {s.title}
              </Text>
              <Text
                className="text-muted-foreground text-[13px] leading-5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {s.body}
              </Text>
            </View>
          </Entrance>
        ))}

        <View className="items-center py-4">
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Last updated: April 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
