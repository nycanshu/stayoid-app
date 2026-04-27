import {
  View, Text, ScrollView, Pressable, TextInput, Linking, Share,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  EnvelopeIcon, PencilIcon, CheckIcon, XIcon,
  MoonIcon, SunIcon, MonitorIcon,
  VibrateIcon, ArrowsClockwiseIcon, ChatDotsIcon, StarIcon,
  ShareIcon, FileTextIcon, ShieldIcon, HeartIcon, InfoIcon,
  SignOutIcon, TrashIcon, SmileyIcon, UsersIcon,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { useThemeStore, type ThemePreference } from '../../../lib/stores/theme-store';
import { usePreferencesStore } from '../../../lib/stores/preferences-store';
import { authApi } from '../../../lib/api/auth';
import { getInitials } from '../../../lib/utils/formatters';
import { SettingsRow, SettingsSection } from '../../../components/settings/SettingsRow';
import { Entrance } from '../../../components/animations';
import { THEME } from '../../../lib/theme';
import { cn } from '../../../lib/utils';

const SUPPORT_EMAIL = 'hello.stayoid@gmail.com';

function ThemePicker() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const options: { value: ThemePreference; label: string; Icon: any }[] = [
    { value: 'system', label: 'System', Icon: MonitorIcon },
    { value: 'light',  label: 'Light',  Icon: SunIcon     },
    { value: 'dark',   label: 'Dark',   Icon: MoonIcon    },
  ];

  return (
    <View className="px-3.5 py-3.5">
      <Text
        className="text-foreground text-sm mb-1"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        Theme
      </Text>
      <Text
        className="text-muted-foreground text-[11px] mb-3"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        Match your phone's appearance or pick a fixed mode
      </Text>
      <View className="flex-row bg-background border border-border rounded-[10px] p-[3px]">
        {options.map((opt) => {
          const active = preference === opt.value;
          const Icon = opt.Icon;
          return (
            <Pressable
              key={opt.value}
              onPress={() => {
                Haptics.selectionAsync();
                setPreference(opt.value);
              }}
              android_ripple={null}
              className={cn(
                'flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-lg',
                active && 'bg-card',
              )}
            >
              <Icon
                size={13}
                color={active ? palette.foreground : palette.mutedForeground}
                weight={active ? 'fill' : 'regular'}
              />
              <Text
                className={cn(
                  'text-xs',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
                style={{
                  fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ProfileCard() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(user?.name ?? '');
  const [saving, setSaving]   = useState(false);

  const startEdit = () => {
    setDraft(user?.name ?? '');
    setEditing(true);
  };

  const save = async () => {
    if (!draft.trim() || draft.trim() === user?.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const updated = await authApi.updateMe({ name: draft.trim() });
      setUser(updated);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditing(false);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="bg-card border border-border rounded-xl p-4 mb-4">
      <View className="flex-row items-center gap-3.5">
        <View className="size-14 rounded-full bg-primary-bg items-center justify-center">
          <Text
            className="text-primary text-lg"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {getInitials(user?.name ?? 'U')}
          </Text>
        </View>

        <View className="flex-1 min-w-0">
          {editing ? (
            <View className="flex-row items-center gap-1.5">
              <TextInput
                value={draft}
                onChangeText={setDraft}
                autoFocus
                autoCapitalize="words"
                placeholder="Your name"
                placeholderTextColor={palette.mutedForeground}
                className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-foreground text-sm"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              />
              <Pressable
                onPress={() => setEditing(false)}
                disabled={saving}
                android_ripple={null}
                hitSlop={6}
                className="size-8 rounded-lg border border-border bg-background items-center justify-center"
              >
                <XIcon size={13} color={palette.mutedForeground} />
              </Pressable>
              <Pressable
                onPress={save}
                disabled={saving}
                android_ripple={null}
                hitSlop={6}
                className="size-8 rounded-lg bg-primary items-center justify-center"
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CheckIcon size={14} color="#fff" weight="bold" />
                )}
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-1.5">
              <Text
                numberOfLines={1}
                className="text-foreground text-base shrink"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                {user?.name ?? 'You'}
              </Text>
              <Pressable
                onPress={startEdit}
                android_ripple={null}
                hitSlop={6}
                className="size-[26px] rounded-md bg-muted items-center justify-center"
              >
                <PencilIcon size={11} color={palette.mutedForeground} />
              </Pressable>
            </View>
          )}
          <View className="flex-row items-center gap-1 mt-1">
            <EnvelopeIcon size={11} color={palette.mutedForeground} />
            <Text
              numberOfLines={1}
              className="text-muted-foreground text-xs shrink"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function formatRelative(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000)         return 'Just now';
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)} hr ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function SettingsScreen() {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];
  const queryClient = useQueryClient();

  const logout = useAuthStore((s) => s.logout);

  const hapticsEnabled    = usePreferencesStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = usePreferencesStore((s) => s.setHapticsEnabled);
  const lastSyncedAt      = usePreferencesStore((s) => s.lastSyncedAt);
  const setLastSyncedAt   = usePreferencesStore((s) => s.setLastSyncedAt);

  const [syncing, setSyncing] = useState(false);
  const [, forceTick]         = useState(0);
  const [focusTick, setFocusTick] = useState(0);

  useFocusEffect(useCallback(() => {
    setFocusTick((t) => t + 1);
    forceTick((t) => t + 1);
  }, []));

  const appVersion = (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  const handleSync = async () => {
    setSyncing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await queryClient.invalidateQueries();
      setLastSyncedAt(new Date().toISOString());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSyncing(false);
    }
  };

  const handleSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Stayoid%20App%20Help`);
  };
  const handleFeedback = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Stayoid%20App%20Feedback`);
  };
  const handleRate = () => {
    Linking.openURL(Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/stayoid'
      : 'https://play.google.com/store/apps/details?id=com.stayoid.app',
    );
  };
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Stayoid — manage your PG/flat rentals from your phone. Try it: https://stayoid.com',
      });
    } catch {/* ignore */}
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out?',
      "You'll need to sign in again to use the app.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            queryClient.clear();
            await logout();
            router.replace('/(auth)/login' as never);
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'Account deletion is permanent and removes every property, tenant, and payment record. We process these manually within 48 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request via email',
          style: 'destructive',
          onPress: () => Linking.openURL(
            `mailto:${SUPPORT_EMAIL}?subject=Stayoid%20Account%20Deletion%20Request`,
          ),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
          <Text
            className="text-foreground text-[22px] tracking-tight"
            style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
          >
            Settings
          </Text>
          <Text
            className="text-muted-foreground text-[13px] mt-0.5"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Customise the app and manage your account
          </Text>
        </Entrance>

        <Entrance trigger={focusTick} delay={60}>
          <ProfileCard />
        </Entrance>

        <Entrance trigger={focusTick} delay={80}>
          <SettingsSection title="Manage">
            <SettingsRow
              type="nav"
              Icon={UsersIcon}
              iconBg={palette.successBg}
              iconColor={palette.success}
              label="Tenants"
              description="View, add, and manage tenants"
              onPress={() => router.push('/(tabs)/tenants' as never)}
              isFirst
              isLast
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={100}>
          <SettingsSection title="Appearance">
            <ThemePicker />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={140}>
          <SettingsSection title="Preferences">
            <SettingsRow
              type="switch"
              Icon={VibrateIcon}
              label="Haptic feedback"
              description="Subtle vibrations on key actions"
              value={hapticsEnabled}
              onValueChange={(v) => {
                if (v) Haptics.selectionAsync();
                setHapticsEnabled(v);
              }}
              isFirst
              isLast
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={180}>
          <SettingsSection title="Data & Sync">
            <Pressable
              onPress={handleSync}
              disabled={syncing}
              android_ripple={null}
              className="flex-row items-center gap-3 px-3.5 py-3"
            >
              <View className="size-8 rounded-lg bg-muted items-center justify-center">
                {syncing ? (
                  <ActivityIndicator size="small" color={palette.primary} />
                ) : (
                  <ArrowsClockwiseIcon size={16} color={palette.mutedForeground} weight="bold" />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-foreground text-sm"
                  style={{ fontFamily: 'Inter_600SemiBold' }}
                >
                  {syncing ? 'Syncing…' : 'Sync now'}
                </Text>
                <Text
                  className="text-muted-foreground text-[11px] mt-0.5"
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  Refresh all dashboards, properties, and tenants
                </Text>
              </View>
            </Pressable>
            <SettingsRow
              type="text"
              Icon={InfoIcon}
              label="Last synced"
              value={formatRelative(lastSyncedAt)}
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={220}>
          <SettingsSection title="Support">
            <SettingsRow
              type="nav"
              Icon={ChatDotsIcon}
              iconBg={palette.infoBg}
              iconColor={palette.info}
              label="Help & Support"
              description="Get in touch with the team"
              onPress={handleSupport}
              isFirst
            />
            <SettingsRow
              type="nav"
              Icon={SmileyIcon}
              iconBg={palette.successBg}
              iconColor={palette.success}
              label="Send Feedback"
              description="Tell us what to improve"
              onPress={handleFeedback}
            />
            <SettingsRow
              type="nav"
              Icon={StarIcon}
              iconBg={palette.warningBg}
              iconColor={palette.warning}
              label="Rate the App"
              description="Loving it? Leave a review"
              onPress={handleRate}
            />
            <SettingsRow
              type="nav"
              Icon={ShareIcon}
              label="Share Stayoid"
              description="Tell another landlord about us"
              onPress={handleShare}
              isLast
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={260}>
          <SettingsSection title="About">
            <SettingsRow
              type="nav"
              Icon={HeartIcon}
              iconBg={palette.primaryBg}
              iconColor={palette.primary}
              label="Meet the developer"
              description="The team behind Stayoid"
              onPress={() => router.push('/(tabs)/settings/about' as never)}
              isFirst
            />
            <SettingsRow
              type="nav"
              Icon={FileTextIcon}
              label="Terms of Service"
              onPress={() => router.push('/(tabs)/settings/terms' as never)}
            />
            <SettingsRow
              type="nav"
              Icon={ShieldIcon}
              label="Privacy Policy"
              onPress={() => router.push('/(tabs)/settings/privacy' as never)}
            />
            <SettingsRow
              type="text"
              Icon={InfoIcon}
              label="Version"
              value={`${appVersion} (${Platform.OS})`}
              isLast
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={300}>
          <SettingsSection title="Account">
            <SettingsRow
              type="nav"
              Icon={SignOutIcon}
              label="Sign out"
              destructive
              onPress={confirmSignOut}
              isFirst
            />
            <SettingsRow
              type="nav"
              Icon={TrashIcon}
              iconBg={palette.destructiveBg}
              iconColor={palette.destructive}
              label="Delete account"
              description="Permanently removes all your data"
              destructive
              onPress={handleDeleteAccount}
              isLast
            />
          </SettingsSection>
        </Entrance>

        <Entrance trigger={focusTick} delay={340}>
          <View className="items-center py-3 gap-1">
            <Text
              className="text-muted-foreground text-[11px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Made with care in India 🇮🇳
            </Text>
            <Text
              className="text-muted-foreground text-[10px]"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Stayoid v{appVersion}
            </Text>
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}
