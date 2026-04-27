import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeftIcon, ShieldCheckIcon } from 'phosphor-react-native';
import { useColors } from '../../../lib/hooks/use-colors';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';

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
    body: 'Stayoid is intended for adults managing rental businesses. We do not knowingly collect data from anyone under 18. If you believe we have, contact us and we\'ll delete it.',
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
  const colors = useColors();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            Privacy Policy
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 13,
            fontFamily: 'Inter_400Regular', marginTop: 2,
          }}>
            What we collect, why, and how to control it
          </Text>
        </Entrance>

        {/* Top reassurance banner */}
        <Entrance trigger={1} delay={40}>
          <View style={{
            backgroundColor: `${colors.success}10`,
            borderWidth: 1, borderColor: `${colors.success}33`,
            borderRadius: 12, padding: 14,
            flexDirection: 'row', alignItems: 'center', gap: 12,
            marginBottom: 16,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: colors.successBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheckIcon size={18} color={colors.success} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 2 }}>
                Your data stays yours
              </Text>
              <Text style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 }}>
                We never sell your data. Encrypted in transit and at rest.
              </Text>
            </View>
          </View>
        </Entrance>

        {SECTIONS.map((s, i) => (
          <Entrance key={s.title} trigger={1} delay={80 + i * 30}>
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
