import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  HeartIcon, ShieldCheckIcon, MapPinIcon, EnvelopeIcon, PaperPlaneTiltIcon,
  GithubLogoIcon, LinkedinLogoIcon, GlobeIcon,
  LockKeyIcon, FlagIcon, ProhibitIcon, DownloadIcon, CaretRightIcon,
} from 'phosphor-react-native';
import Constants from 'expo-constants';
import { useColorScheme } from 'nativewind';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';

const FOUNDERS = [
  {
    name: 'Himanshu Kumar',
    role: 'Founder & Developer',
    photo: 'https://github.com/nycanshu.png',
    bio:
      'Building Stayoid end-to-end after watching family and friends manage '
      + 'rentals on paper. Want every landlord in India to feel in control.',
    links: [
      { kind: 'github',   label: 'GitHub',   url: 'https://github.com/nycanshu' },
      { kind: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/nycanshu' },
      { kind: 'email',    label: 'Email',    url: 'mailto:hello.stayoid@gmail.com' },
    ],
  },
] as const;

const SUPPORT_EMAIL = 'hello.stayoid@gmail.com';

function getLinkIcon(kind: 'github' | 'linkedin' | 'email' | 'web') {
  if (kind === 'github')   return GithubLogoIcon;
  if (kind === 'linkedin') return LinkedinLogoIcon;
  if (kind === 'email')    return EnvelopeIcon;
  return GlobeIcon;
}

/** One row of the trust commitments list — colored chip + bold rule. */
function TrustRow({
  Icon, color, bg, text,
}: {
  Icon: React.ComponentType<{ size: number; color: string; weight?: any }>;
  color: string;
  bg: string;
  text: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View
        style={{ backgroundColor: bg }}
        className="size-8 rounded-lg items-center justify-center"
      >
        <Icon size={15} color={color} weight="fill" />
      </View>
      <Text
        className="text-foreground text-[13px] flex-1 leading-5"
        style={{ fontFamily: 'Inter_500Medium' }}
      >
        {text}
      </Text>
    </View>
  );
}

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

export default function AboutScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const appVersion = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle
        <Entrance trigger={1} style={{ marginBottom: 18 }}>
          <Text
            className="text-muted-foreground text-[13px]"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Property management built for India.
          </Text>
        </Entrance> */}

        {/* Mission */}
        <Entrance trigger={1} delay={40}>
          <SectionLabel>Our mission</SectionLabel>
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <Text
              className="text-foreground text-[14px] leading-[22px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Running a PG, hostel, or set of flats in India shouldn't require
              a desk full of registers. Stayoid puts your entire rental
              business in your pocket every property, every tenant, every
              payment, every reminder.
            </Text>
          </View>
        </Entrance>

        {/* Founders */}
        <Entrance trigger={1} delay={80}>
          <SectionLabel>{FOUNDERS.length > 1 ? 'Founders' : 'Founder'}</SectionLabel>
          {FOUNDERS.map((founder) => (
            <View
              key={founder.name}
              className="bg-card border border-border rounded-xl p-4 mb-4"
            >
              <View className="flex-row items-center gap-3.5 mb-3">
                <Image
                  source={founder.photo}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <View className="flex-1 min-w-0">
                  <Text
                    numberOfLines={1}
                    className="text-foreground text-[15px]"
                    style={{ fontFamily: 'Inter_600SemiBold' }}
                  >
                    {founder.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-muted-foreground text-xs mt-0.5"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {founder.role}
                  </Text>
                </View>
              </View>

              <Text
                className="text-foreground text-[13px] leading-[20px] mb-3.5"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                {founder.bio}
              </Text>

              <View className="flex-row gap-2">
                {founder.links.map((link) => {
                  const Icon = getLinkIcon(link.kind);
                  return (
                    <Pressable
                      key={link.kind}
                      onPress={() => Linking.openURL(link.url)}
                      android_ripple={null}
                      hitSlop={6}
                      className="flex-1 items-center justify-center bg-background border border-border rounded-[10px] py-2 gap-1"
                    >
                      <Icon size={16} color={palette.foreground} />
                      <Text
                        className="text-foreground text-[11px]"
                        style={{ fontFamily: 'Inter_500Medium' }}
                      >
                        {link.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </Entrance>

        {/* Trust commitments */}
        <Entrance trigger={1} delay={140}>
          <SectionLabel>Your data, your control</SectionLabel>
          <View className="bg-card border border-border rounded-xl p-4 mb-2.5">
            <TrustRow
              Icon={LockKeyIcon}
              color={palette.success}
              bg={palette.successBg}
              text="Encrypted at rest and in transit"
            />
            <TrustRow
              Icon={FlagIcon}
              color={palette.info}
              bg={palette.infoBg}
              text="Stored in India on managed cloud servers"
            />
            <TrustRow
              Icon={ProhibitIcon}
              color={palette.destructive}
              bg={palette.destructiveBg}
              text="We never sell or share your data"
            />
            <TrustRow
              Icon={DownloadIcon}
              color={palette.warning}
              bg={palette.warningBg}
              text="Export or delete your data any time"
            />
          </View>

          {/* Privacy / Terms quick-links */}
          <View className="flex-row gap-2 mb-4">
            <Pressable
              onPress={() => router.push('/settings/privacy' as never)}
              android_ripple={null}
              className="flex-1 flex-row items-center justify-between bg-card border border-border rounded-xl px-3.5 py-3"
            >
              <View className="flex-row items-center gap-2">
                <ShieldCheckIcon size={14} color={palette.mutedForeground} />
                <Text
                  className="text-foreground text-[13px]"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  Privacy
                </Text>
              </View>
              <CaretRightIcon size={12} color={palette.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/settings/terms' as never)}
              android_ripple={null}
              className="flex-1 flex-row items-center justify-between bg-card border border-border rounded-xl px-3.5 py-3"
            >
              <View className="flex-row items-center gap-2">
                <ShieldCheckIcon size={14} color={palette.mutedForeground} />
                <Text
                  className="text-foreground text-[13px]"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  Terms
                </Text>
              </View>
              <CaretRightIcon size={12} color={palette.mutedForeground} />
            </Pressable>
          </View>
        </Entrance>

        {/* Feedback CTA */}
        <Entrance trigger={1} delay={200}>
          <SectionLabel>Got feedback?</SectionLabel>
          <View className="bg-card border border-border rounded-xl p-4 mb-4">
            <Text
              className="text-foreground text-[13px] leading-[20px] mb-3"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              We read every message. Email{' '}
              <Text
                className="text-foreground"
                style={{ fontFamily: 'Inter_600SemiBold' }}
                selectable
              >
                {SUPPORT_EMAIL}
              </Text>
              {' '}and we'll respond within 48 hours.
            </Text>
            <Pressable
              onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Stayoid%20Feedback`)}
              android_ripple={null}
              className="bg-primary rounded-[10px] py-3 flex-row items-center justify-center gap-2"
            >
              <PaperPlaneTiltIcon size={14} color="#fff" weight="fill" />
              <Text
                className="text-white text-[13px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Send feedback
              </Text>
            </Pressable>
          </View>
        </Entrance>

        {/* Trust footer */}
        <Entrance trigger={1} delay={260}>
          <View className="items-center pt-2 pb-4 gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Text
                className="text-foreground text-[12px]"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Stayoid v{appVersion}
              </Text>
              <Text
                className="text-muted-foreground text-[12px]"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                · Independent
              </Text>
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
                in India
              </Text>
              <MapPinIcon size={10} color={palette.mutedForeground} />
            </View>
            <Text
              className="text-muted-foreground text-[10px] mt-0.5"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              © 2026 Stayoid
            </Text>
          </View>
        </Entrance>
      </ScrollView>
    </View>
  );
}
