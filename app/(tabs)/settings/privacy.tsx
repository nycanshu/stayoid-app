import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ShieldCheckIcon, EnvelopeIcon, PaperPlaneTiltIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';
import { APP_META, mailto } from '../../../lib/constants/app-meta';

const GROUPS = [
  {
    label: 'What & why',
    rows: [
      {
        title: 'What we collect',
        body: 'Account information (name, email, phone), the property/tenant/payment records you enter, and basic device info to keep the app running. We do not collect contacts, photos, or location data.',
      },
      {
        title: 'How we use it',
        body: 'Your data powers Stayoid features — dashboards, tenant lookups, payment summaries. We do not sell your data, ever. Aggregated, anonymised statistics may be used to improve the product.',
      },
    ],
  },
  {
    label: 'Storage & access',
    rows: [
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
    ],
  },
  {
    label: 'Your rights',
    rows: [
      {
        title: 'Your controls',
        body: `Edit your profile from Settings → Profile. Change appearance preferences any time. Request permanent deletion via Settings → Delete account — we process these manually within ${APP_META.policies.responseSla}.`,
      },
      {
        title: 'Children',
        body: "Stayoid is intended for adults managing rental businesses. We do not knowingly collect data from anyone under 18. If you believe we have, contact us and we'll delete it.",
      },
    ],
  },
  {
    label: 'Policy updates',
    rows: [
      {
        title: 'Changes to this policy',
        body: 'We update this policy as the product evolves. Material changes are surfaced in-app. Continued use of Stayoid after a change means you accept the updated policy.',
      },
    ],
  },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      className="text-muted-foreground text-[11px] uppercase tracking-[1px] mb-2 px-1"
      style={{ fontFamily: 'Inter_600SemiBold' }}
    >
      {children}
    </Text>
  );
}

function PolicyRow({
  title, body, isFirst,
}: { title: string; body: string; isFirst: boolean }) {
  return (
    <View
      className={`px-4 py-3.5 ${isFirst ? '' : 'border-t border-border'}`}
    >
      <Text
        className="text-foreground text-[14px] mb-1"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {title}
      </Text>
      <Text
        className="text-muted-foreground text-[13px] leading-[20px]"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        {body}
      </Text>
    </View>
  );
}

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
        {/* Trust hero */}
        <Entrance trigger={1} delay={40}>
          <View className="bg-success-bg border border-border rounded-xl p-4 flex-row items-center gap-3 mb-4">
            <View className="size-10 rounded-[10px] bg-card items-center justify-center">
              <ShieldCheckIcon size={20} color={palette.success} weight="fill" />
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground text-[14px] mb-0.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Your data stays yours
              </Text>
              <Text
                className="text-muted-foreground text-[12px] leading-[17px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                We never sell your data. Encrypted in transit and at rest.
              </Text>
            </View>
          </View>
        </Entrance>

        {GROUPS.map((group, gi) => (
          <Entrance key={group.label} trigger={1} delay={80 + gi * 40}>
            <SectionLabel>{group.label}</SectionLabel>
            <View className="bg-card border border-border rounded-xl mb-4 overflow-hidden">
              {group.rows.map((row, ri) => (
                <PolicyRow
                  key={row.title}
                  title={row.title}
                  body={row.body}
                  isFirst={ri === 0}
                />
              ))}
            </View>
          </Entrance>
        ))}

        {/* Contact CTA */}
        <Entrance trigger={1} delay={80 + GROUPS.length * 40}>
          <SectionLabel>Privacy questions?</SectionLabel>
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="size-9 rounded-[10px] bg-muted items-center justify-center">
                <EnvelopeIcon size={16} color={palette.mutedForeground} weight="duotone" />
              </View>
              <Text
                className="text-foreground text-[13px] flex-1 leading-[19px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Email{' '}
                <Text style={{ fontFamily: 'Inter_600SemiBold' }} selectable>
                  {APP_META.supportEmail}
                </Text>
                {' '}for privacy requests or account deletion.
              </Text>
            </View>
            <Pressable
              onPress={() => Linking.openURL(mailto('Privacy'))}
              android_ripple={null}
              className="bg-primary rounded-[10px] py-3 flex-row items-center justify-center gap-2"
            >
              <PaperPlaneTiltIcon size={14} color="#fff" weight="fill" />
              <Text
                className="text-white text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Contact privacy team
              </Text>
            </Pressable>
          </View>
        </Entrance>

        <View className="items-center pt-2 pb-4">
          <Text
            className="text-muted-foreground text-[11px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Last updated: {APP_META.policies.lastUpdated}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
