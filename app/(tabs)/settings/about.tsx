import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowLeftIcon, HeartIcon, RocketIcon, SparkleIcon,
  GithubLogoIcon, LinkedinLogoIcon, EnvelopeIcon, GlobeIcon,
} from 'phosphor-react-native';
import Constants from 'expo-constants';
import { useColors } from '../../../lib/hooks/use-colors';
import { getInitials } from '../../../lib/utils/formatters';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';

// ── Team — edit these as the team grows ──────────────────────────────────────
type Link = { kind: 'github' | 'linkedin' | 'email' | 'web'; url: string };
type Member = {
  name: string;
  role: string;
  bio?: string;
  links?: Link[];
};

const TEAM: Member[] = [
  {
    name: 'Himanshu Kumar',
    role: 'Founder · Product · Engineering',
    bio: 'Building Stayoid end-to-end so PG and flat owners in India can run their business from their phone.',
    links: [
      { kind: 'github',   url: 'https://github.com/nycanshu' },
      { kind: 'linkedin', url: 'https://linkedin.com/in/nycanshu' },
      { kind: 'email',    url: 'mailto:hello.stayoid@gmail.com' },
    ],
  },
  // Add team members here as they join — same shape.
];

// ── Tech & values shown as chips for character ───────────────────────────────
const TECH_STACK = [
  'React Native', 'Expo', 'Next.js', 'Django', 'TypeScript', 'Tailwind',
  'TanStack Query', 'Zod', 'Reanimated', 'PostgreSQL',
];

function getLinkIcon(kind: Link['kind']) {
  if (kind === 'github')   return GithubLogoIcon;
  if (kind === 'linkedin') return LinkedinLogoIcon;
  if (kind === 'email')    return EnvelopeIcon;
  return GlobeIcon;
}

function MemberCard({ member, colors }: { member: Member; colors: AppColors }) {
  return (
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 10,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: member.bio ? 12 : 0 }}>
        <View style={{
          width: 52, height: 52, borderRadius: 26,
          backgroundColor: colors.primaryBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: colors.primary, fontSize: 17, fontFamily: 'Inter_600SemiBold' }}>
            {getInitials(member.name)}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ color: colors.foreground, fontSize: 15, fontFamily: 'Inter_600SemiBold' }}
          >
            {member.name}
          </Text>
          <Text
            numberOfLines={2}
            style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 }}
          >
            {member.role}
          </Text>
        </View>
      </View>

      {member.bio && (
        <Text style={{
          color: colors.foreground, fontSize: 13,
          fontFamily: 'Inter_400Regular', lineHeight: 19, marginBottom: 12,
        }}>
          {member.bio}
        </Text>
      )}

      {member.links && member.links.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {member.links.map((link, i) => {
            const Icon = getLinkIcon(link.kind);
            return (
              <Pressable
                key={i}
                onPress={() => Linking.openURL(link.url)}
                android_ripple={null}
                hitSlop={6}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  borderWidth: 1, borderColor: colors.border,
                  backgroundColor: colors.background,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon size={15} color={colors.foreground} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function AboutScreen() {
  const colors = useColors();
  const appVersion = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
            Meet the developer
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 13,
            fontFamily: 'Inter_400Regular', marginTop: 2,
          }}>
            The team behind Stayoid
          </Text>
        </Entrance>

        {/* Hero — what Stayoid is */}
        <Entrance trigger={1} delay={40}>
          <View style={{
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, padding: 18, marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <View style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: colors.primaryBg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <RocketIcon size={18} color={colors.primary} weight="fill" />
              </View>
              <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                Stayoid
              </Text>
            </View>
            <Text style={{
              color: colors.foreground, fontSize: 14,
              fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 4,
            }}>
              Property management for PG, hostel, and flat owners — built for India, designed for the phone.
            </Text>
          </View>
        </Entrance>

        {/* Team */}
        <Entrance trigger={1} delay={80}>
          <Text style={{
            color: colors.mutedFg, fontSize: 11,
            fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4,
          }}>
            Team
          </Text>
        </Entrance>
        {TEAM.map((m, i) => (
          <Entrance key={m.name} trigger={1} delay={120 + i * 60}>
            <MemberCard member={m} colors={colors} />
          </Entrance>
        ))}

        {/* Tech stack */}
        <Entrance trigger={1} delay={120 + TEAM.length * 60 + 40}>
          <Text style={{
            color: colors.mutedFg, fontSize: 11,
            fontFamily: 'Inter_600SemiBold', letterSpacing: 1,
            textTransform: 'uppercase', marginTop: 8, marginBottom: 8, paddingHorizontal: 4,
          }}>
            Built with
          </Text>
          <View style={{
            backgroundColor: colors.card,
            borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, padding: 14,
            flexDirection: 'row', flexWrap: 'wrap', gap: 6,
            marginBottom: 16,
          }}>
            {TECH_STACK.map((t) => (
              <View
                key={t}
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5,
                }}
              >
                <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_600SemiBold' }}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </Entrance>

        {/* Thanks footer */}
        <Entrance trigger={1} delay={120 + TEAM.length * 60 + 100}>
          <View style={{
            alignItems: 'center', paddingVertical: 18, gap: 8,
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
            }}>
              <SparkleIcon size={13} color={colors.warning} weight="fill" />
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: 'Inter_600SemiBold' }}>
                Thank you for using Stayoid
              </Text>
              <SparkleIcon size={13} color={colors.warning} weight="fill" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                Made with
              </Text>
              <HeartIcon size={11} color={colors.danger} weight="fill" />
              <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
                in India · v{appVersion}
              </Text>
            </View>
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}
