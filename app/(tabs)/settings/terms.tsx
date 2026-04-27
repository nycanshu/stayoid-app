import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColorScheme } from 'nativewind';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using Stayoid you agree to these Terms of Service. If you do not agree, please uninstall the app.',
  },
  {
    title: '2. Account Responsibility',
    body: 'You are responsible for keeping your login credentials safe and for every action taken through your account. Notify us immediately if you suspect unauthorised access.',
  },
  {
    title: '3. Acceptable Use',
    body: 'Stayoid is provided for managing legitimate residential rentals (PGs, hostels, flats). You agree not to use the service for unlawful, fraudulent, or harmful purposes, and not to record sensitive personal data beyond what is needed to manage tenancies.',
  },
  {
    title: '4. Content Ownership',
    body: 'You retain ownership of the property, tenant, and payment data you enter. Stayoid stores this data securely on your behalf to provide the service. We do not sell your data to third parties.',
  },
  {
    title: '5. Service Availability',
    body: 'We work hard to keep Stayoid available, but we do not guarantee uninterrupted service. Scheduled maintenance and unforeseen outages may occur.',
  },
  {
    title: '6. Subscription & Pricing',
    body: 'Stayoid is currently free to use. If we introduce paid plans in the future, existing users will receive at least 30 days notice and the option to export their data.',
  },
  {
    title: '7. Termination',
    body: 'You may delete your account at any time from Settings → Delete account. We may suspend accounts that violate these Terms or applicable law.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'Stayoid is provided "as is." To the fullest extent permitted by law, we are not liable for any indirect or consequential damages arising from your use of the app, including financial loss from missed payments or incorrect records.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms occasionally. Material changes will be communicated in-app or by email. Continued use of Stayoid after the change date constitutes acceptance.',
  },
  {
    title: '10. Contact',
    body: "Questions? Email hello.stayoid@gmail.com and we'll get back to you within two business days.",
  },
];

function LegalScreen({
  title, subtitle, sections,
}: {
  title: string; subtitle: string;
  sections: { title: string; body: string }[];
}) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Entrance trigger={1} style={{ marginBottom: 20 }}>
          <View className="flex-row items-center mb-3.5">
            <Pressable
              onPress={() => router.back()}
              android_ripple={null}
              hitSlop={8}
              className="size-10 rounded-[10px] border border-border bg-card items-center justify-center"
            >
              <ArrowLeftIcon size={18} color={palette.foreground} />
            </Pressable>
          </View>
          <Text
            className="text-foreground text-[22px] tracking-tight"
            style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
          >
            {title}
          </Text>
          <Text
            className="text-muted-foreground text-[13px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {subtitle}
          </Text>
        </Entrance>

        {sections.map((s, i) => (
          <Entrance key={s.title} trigger={1} delay={60 + i * 30}>
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
    </SafeAreaView>
  );
}

export default function TermsScreen() {
  return (
    <LegalScreen
      title="Terms of Service"
      subtitle="The rules that govern your use of Stayoid"
      sections={SECTIONS}
    />
  );
}
