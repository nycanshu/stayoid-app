import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ArrowLeftIcon, HeartIcon, RocketIcon, SparkleIcon,
  GithubLogoIcon, LinkedinLogoIcon, EnvelopeIcon, GlobeIcon,
} from 'phosphor-react-native';
import Constants from 'expo-constants';
import { useColorScheme } from 'nativewind';
import { getInitials } from '../../../lib/utils/formatters';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

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
];

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

function MemberCard({ member, fg }: { member: Member; fg: string }) {
  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-2.5">
      <View
        className="flex-row items-center gap-3.5"
        style={{ marginBottom: member.bio ? 12 : 0 }}
      >
        <View className="size-[52px] rounded-full bg-primary-bg items-center justify-center">
          <Text
            className="text-primary text-[17px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {getInitials(member.name)}
          </Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text
            numberOfLines={1}
            className="text-foreground text-[15px]"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {member.name}
          </Text>
          <Text
            numberOfLines={2}
            className="text-muted-foreground text-xs mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {member.role}
          </Text>
        </View>
      </View>

      {member.bio && (
        <Text
          className="text-foreground text-[13px] leading-[19px] mb-3"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {member.bio}
        </Text>
      )}

      {member.links && member.links.length > 0 && (
        <View className="flex-row gap-2">
          {member.links.map((link, i) => {
            const Icon = getLinkIcon(link.kind);
            return (
              <Pressable
                key={i}
                onPress={() => Linking.openURL(link.url)}
                android_ripple={null}
                hitSlop={6}
                className="size-9 rounded-[10px] border border-border bg-background items-center justify-center"
              >
                <Icon size={15} color={fg} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const appVersion = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

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
            Meet the developer
          </Text>
          <Text
            className="text-muted-foreground text-[13px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            The team behind Stayoid
          </Text>
        </Entrance>

        <Entrance trigger={1} delay={40}>
          <View className="bg-card border border-border rounded-xl p-[18px] mb-4">
            <View className="flex-row items-center gap-2.5 mb-2.5">
              <View className="size-[38px] rounded-[10px] bg-primary-bg items-center justify-center">
                <RocketIcon size={18} color={palette.primary} weight="fill" />
              </View>
              <Text
                className="text-foreground text-base"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Stayoid
              </Text>
            </View>
            <Text
              className="text-foreground text-sm leading-[21px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Property management for PG, hostel, and flat owners — built for India, designed for the phone.
            </Text>
          </View>
        </Entrance>

        <Entrance trigger={1} delay={80}>
          <Text
            className="text-muted-foreground text-[11px] uppercase tracking-[1px] mb-2 px-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Team
          </Text>
        </Entrance>
        {TEAM.map((m, i) => (
          <Entrance key={m.name} trigger={1} delay={120 + i * 60}>
            <MemberCard member={m} fg={palette.foreground} />
          </Entrance>
        ))}

        <Entrance trigger={1} delay={120 + TEAM.length * 60 + 40}>
          <Text
            className="text-muted-foreground text-[11px] uppercase tracking-[1px] mt-2 mb-2 px-1"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Built with
          </Text>
          <View className="bg-card border border-border rounded-xl p-3.5 flex-row flex-wrap gap-1.5 mb-4">
            {TECH_STACK.map((t) => (
              <View
                key={t}
                className="bg-background border border-border rounded-full px-2.5 py-1"
              >
                <Text
                  className="text-muted-foreground text-[11px]"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </Entrance>

        <Entrance trigger={1} delay={120 + TEAM.length * 60 + 100}>
          <View className="items-center py-[18px] gap-2">
            <View className="flex-row items-center gap-1.5">
              <SparkleIcon size={13} color={palette.warning} weight="fill" />
              <Text
                className="text-foreground text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Thank you for using Stayoid
              </Text>
              <SparkleIcon size={13} color={palette.warning} weight="fill" />
            </View>
            <View className="flex-row items-center gap-1">
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Made with
              </Text>
              <HeartIcon size={11} color={palette.destructive} weight="fill" />
              <Text
                className="text-muted-foreground text-[11px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                in India · v{appVersion}
              </Text>
            </View>
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}
