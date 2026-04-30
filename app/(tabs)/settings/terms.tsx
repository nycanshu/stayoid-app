import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  ScalesIcon, EnvelopeIcon, PaperPlaneTiltIcon,
} from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

const SUPPORT_EMAIL = 'hello.stayoid@gmail.com';

const GROUPS = [
  {
    label: 'Getting started',
    rows: [
      {
        title: 'Acceptance of Terms',
        body: 'By creating an account or using Stayoid you agree to these Terms of Service. If you do not agree, please uninstall the app.',
      },
      {
        title: 'Account responsibility',
        body: 'You are responsible for keeping your login credentials safe and for every action taken through your account. Notify us immediately if you suspect unauthorised access.',
      },
    ],
  },
  {
    label: 'Using the app',
    rows: [
      {
        title: 'Acceptable use',
        body: 'Stayoid is provided for managing legitimate residential rentals (PGs, hostels, flats). You agree not to use the service for unlawful, fraudulent, or harmful purposes, and not to record sensitive personal data beyond what is needed to manage tenancies.',
      },
      {
        title: 'Content ownership',
        body: 'You retain ownership of the property, tenant, and payment data you enter. Stayoid stores this data securely on your behalf to provide the service. We do not sell your data to third parties.',
      },
    ],
  },
  {
    label: 'Service & subscription',
    rows: [
      {
        title: 'Service availability',
        body: 'We work hard to keep Stayoid available, but we do not guarantee uninterrupted service. Scheduled maintenance and unforeseen outages may occur.',
      },
      {
        title: 'Subscription & pricing',
        body: 'Stayoid is currently free to use. If we introduce paid plans in the future, existing users will receive at least 30 days notice and the option to export their data.',
      },
      {
        title: 'Termination',
        body: 'You may delete your account at any time from Settings → Delete account. We may suspend accounts that violate these Terms or applicable law.',
      },
    ],
  },
  {
    label: 'Legal',
    rows: [
      {
        title: 'Limitation of liability',
        body: 'Stayoid is provided "as is." To the fullest extent permitted by law, we are not liable for any indirect or consequential damages arising from your use of the app, including financial loss from missed payments or incorrect records.',
      },
      {
        title: 'Changes to these terms',
        body: 'We may update these Terms occasionally. Material changes will be communicated in-app or by email. Continued use of Stayoid after the change date constitutes acceptance.',
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

export default function TermsScreen() {
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
        {/* Hero */}
        <Entrance trigger={1} delay={40}>
          <View className="bg-info-bg border border-border rounded-xl p-4 flex-row items-center gap-3 mb-4">
            <View className="size-10 rounded-[10px] bg-card items-center justify-center">
              <ScalesIcon size={20} color={palette.info} weight="fill" />
            </View>
            <View className="flex-1">
              <Text
                className="text-foreground text-[14px] mb-0.5"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                The rules, in plain language
              </Text>
              <Text
                className="text-muted-foreground text-[12px] leading-[17px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Use Stayoid responsibly. We do our part to keep it running.
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
          <SectionLabel>Questions?</SectionLabel>
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
                  {SUPPORT_EMAIL}
                </Text>
                {' '}— we respond within two business days.
              </Text>
            </View>
            <Pressable
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Stayoid%20Terms`)}
              android_ripple={null}
              className="bg-primary rounded-[10px] py-3 flex-row items-center justify-center gap-2"
            >
              <PaperPlaneTiltIcon size={14} color="#fff" weight="fill" />
              <Text
                className="text-white text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Contact support
              </Text>
            </Pressable>
          </View>
        </Entrance>

        <View className="items-center pt-2 pb-4">
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
