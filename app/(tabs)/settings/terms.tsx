import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColors } from '../../../lib/hooks/use-colors';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';

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
    body: 'Stayoid is provided “as is.” To the fullest extent permitted by law, we are not liable for any indirect or consequential damages arising from your use of the app, including financial loss from missed payments or incorrect records.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms occasionally. Material changes will be communicated in-app or by email. Continued use of Stayoid after the change date constitutes acceptance.',
  },
  {
    title: '10. Contact',
    body: 'Questions? Email hello.stayoid@gmail.com and we\'ll get back to you within two business days.',
  },
];

function LegalScreen({
  title, subtitle, sections, colors,
}: {
  title: string; subtitle: string;
  sections: { title: string; body: string }[];
  colors: AppColors;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Entrance trigger={1} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Pressable
              onPress={() => router.back()}
              android_ripple={null}
              hitSlop={8}
              style={{
                width: 40, height: 40, borderRadius: 10,
                borderWidth: 1, borderColor: colors.border,
                backgroundColor: colors.card,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ArrowLeftIcon size={18} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={{
            color: colors.foreground,
            fontSize: 22, fontFamily: 'Inter_600SemiBold',
            letterSpacing: -0.3, paddingRight: 0.3,
          }}>
            {title}
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 13,
            fontFamily: 'Inter_400Regular', marginTop: 2,
          }}>
            {subtitle}
          </Text>
        </Entrance>

        {sections.map((s, i) => (
          <Entrance key={s.title} trigger={1} delay={60 + i * 30}>
            <View style={{
              backgroundColor: colors.card,
              borderWidth: 1, borderColor: colors.border,
              borderRadius: 12, padding: 16, marginBottom: 10,
            }}>
              <Text style={{
                color: colors.foreground, fontSize: 14,
                fontFamily: 'Inter_600SemiBold', marginBottom: 6,
              }}>
                {s.title}
              </Text>
              <Text style={{
                color: colors.mutedFg, fontSize: 13,
                fontFamily: 'Inter_400Regular', lineHeight: 20,
              }}>
                {s.body}
              </Text>
            </View>
          </Entrance>
        ))}

        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
            Last updated: April 2026
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function TermsScreen() {
  const colors = useColors();
  return (
    <LegalScreen
      title="Terms of Service"
      subtitle="The rules that govern your use of Stayoid"
      sections={SECTIONS}
      colors={colors}
    />
  );
}
