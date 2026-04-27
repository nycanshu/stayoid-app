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
import { useAuthStore } from '../../../lib/stores/auth-store';
import { useThemeStore, type ThemePreference } from '../../../lib/stores/theme-store';
import { usePreferencesStore } from '../../../lib/stores/preferences-store';
import { useColors } from '../../../lib/hooks/use-colors';
import { authApi } from '../../../lib/api/auth';
import { getInitials } from '../../../lib/utils/formatters';
import { SettingsRow, SettingsSection } from '../../../components/settings/SettingsRow';
import { Entrance } from '../../../components/animations';
import type { AppColors } from '../../../lib/theme/colors';

const SUPPORT_EMAIL = 'hello.stayoid@gmail.com';

// ── Theme picker (3-option segmented control) ─────────────────────────────────
function ThemePicker({ colors }: { colors: AppColors }) {
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  const options: { value: ThemePreference; label: string; Icon: any }[] = [
    { value: 'system', label: 'System', Icon: MonitorIcon },
    { value: 'light',  label: 'Light',  Icon: SunIcon     },
    { value: 'dark',   label: 'Dark',   Icon: MoonIcon    },
  ];

  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
      <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 4 }}>
        Theme
      </Text>
      <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 12 }}>
        Match your phone's appearance or pick a fixed mode
      </Text>
      <View style={{
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderWidth: 1, borderColor: colors.border,
        borderRadius: 10, padding: 3,
      }}>
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
              style={{
                flex: 1,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                paddingVertical: 8, borderRadius: 8,
                backgroundColor: active ? colors.card : 'transparent',
              }}
            >
              <Icon size={13} color={active ? colors.foreground : colors.mutedFg} weight={active ? 'fill' : 'regular'} />
              <Text style={{
                color: active ? colors.foreground : colors.mutedFg,
                fontSize: 12,
                fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
              }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Profile card with inline edit ─────────────────────────────────────────────
function ProfileCard({ colors }: { colors: AppColors }) {
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
    <View style={{
      backgroundColor: colors.card,
      borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, marginBottom: 16,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: colors.primaryBg,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
            {getInitials(user?.name ?? 'U')}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                autoFocus
                autoCapitalize="words"
                placeholder="Your name"
                placeholderTextColor={colors.mutedFg}
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  borderWidth: 1, borderColor: colors.border,
                  borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
                  color: colors.foreground,
                  fontSize: 14, fontFamily: 'Inter_600SemiBold',
                }}
              />
              <Pressable
                onPress={() => setEditing(false)}
                disabled={saving}
                android_ripple={null}
                hitSlop={6}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  borderWidth: 1, borderColor: colors.border,
                  backgroundColor: colors.background,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <XIcon size={13} color={colors.mutedFg} />
              </Pressable>
              <Pressable
                onPress={save}
                disabled={saving}
                android_ripple={null}
                hitSlop={6}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <CheckIcon size={14} color="#fff" weight="bold" />
                )}
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: colors.foreground, fontSize: 16,
                  fontFamily: 'Inter_600SemiBold', flexShrink: 1,
                }}
              >
                {user?.name ?? 'You'}
              </Text>
              <Pressable
                onPress={startEdit}
                android_ripple={null}
                hitSlop={6}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  backgroundColor: colors.mutedBg,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <PencilIcon size={11} color={colors.mutedFg} />
              </Pressable>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <EnvelopeIcon size={11} color={colors.mutedFg} />
            <Text
              numberOfLines={1}
              style={{ color: colors.mutedFg, fontSize: 12, fontFamily: 'Inter_400Regular', flexShrink: 1 }}
            >
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Last-synced relative formatter ────────────────────────────────────────────
function formatRelative(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000)         return 'Just now';
  if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)} hr ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const colors = useColors();
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
    // re-render so "X min ago" updates
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
    // Will swap to a real store URL when published
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

  // Native Alert.alert for destructive confirms — guaranteed cross-platform rendering
  const confirmSignOut = () => {
    Alert.alert(
      'Sign out?',
      'You\'ll need to sign in again to use the app.',
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
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Entrance trigger={focusTick} style={{ marginBottom: 20 }}>
          <Text style={{
            color: colors.foreground,
            fontSize: 22, fontFamily: 'Inter_600SemiBold',
            letterSpacing: -0.3, paddingRight: 0.3,
          }}>
            Settings
          </Text>
          <Text style={{
            color: colors.mutedFg, fontSize: 13,
            fontFamily: 'Inter_400Regular', marginTop: 2,
          }}>
            Customise the app and manage your account
          </Text>
        </Entrance>

        {/* ── Profile card ── */}
        <Entrance trigger={focusTick} delay={60}>
          <ProfileCard colors={colors} />
        </Entrance>

        {/* ── Manage ── */}
        <Entrance trigger={focusTick} delay={80}>
          <SettingsSection title="Manage" colors={colors}>
            <SettingsRow
              type="nav"
              Icon={UsersIcon}
              iconBg={colors.successBg}
              iconColor={colors.success}
              label="Tenants"
              description="View, add, and manage tenants"
              onPress={() => router.push('/(tabs)/tenants' as never)}
              isFirst
              isLast
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* ── Appearance ── */}
        <Entrance trigger={focusTick} delay={100}>
          <SettingsSection title="Appearance" colors={colors}>
            <ThemePicker colors={colors} />
          </SettingsSection>
        </Entrance>

        {/* ── Preferences ── */}
        <Entrance trigger={focusTick} delay={140}>
          <SettingsSection title="Preferences" colors={colors}>
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
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* ── Data & Sync ── */}
        <Entrance trigger={focusTick} delay={180}>
          <SettingsSection title="Data & Sync" colors={colors}>
            <Pressable
              onPress={handleSync}
              disabled={syncing}
              android_ripple={null}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 14, paddingVertical: 12,
              }}
            >
              <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: colors.mutedBg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {syncing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <ArrowsClockwiseIcon size={16} color={colors.mutedFg} weight="bold" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: 'Inter_600SemiBold' }}>
                  {syncing ? 'Syncing…' : 'Sync now'}
                </Text>
                <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 }}>
                  Refresh all dashboards, properties, and tenants
                </Text>
              </View>
            </Pressable>
            <SettingsRow
              type="text"
              Icon={InfoIcon}
              label="Last synced"
              value={formatRelative(lastSyncedAt)}
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* ── Support ── */}
        <Entrance trigger={focusTick} delay={220}>
          <SettingsSection title="Support" colors={colors}>
            <SettingsRow
              type="nav"
              Icon={ChatDotsIcon}
              iconBg={colors.infoBg}
              iconColor={colors.info}
              label="Help & Support"
              description="Get in touch with the team"
              onPress={handleSupport}
              isFirst
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={SmileyIcon}
              iconBg={colors.successBg}
              iconColor={colors.success}
              label="Send Feedback"
              description="Tell us what to improve"
              onPress={handleFeedback}
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={StarIcon}
              iconBg={colors.warningBg}
              iconColor={colors.warning}
              label="Rate the App"
              description="Loving it? Leave a review"
              onPress={handleRate}
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={ShareIcon}
              label="Share Stayoid"
              description="Tell another landlord about us"
              onPress={handleShare}
              isLast
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* ── About ── */}
        <Entrance trigger={focusTick} delay={260}>
          <SettingsSection title="About" colors={colors}>
            <SettingsRow
              type="nav"
              Icon={HeartIcon}
              iconBg={colors.primaryBg}
              iconColor={colors.primary}
              label="Meet the developer"
              description="The team behind Stayoid"
              onPress={() => router.push('/(tabs)/settings/about' as never)}
              isFirst
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={FileTextIcon}
              label="Terms of Service"
              onPress={() => router.push('/(tabs)/settings/terms' as never)}
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={ShieldIcon}
              label="Privacy Policy"
              onPress={() => router.push('/(tabs)/settings/privacy' as never)}
              colors={colors}
            />
            <SettingsRow
              type="text"
              Icon={InfoIcon}
              label="Version"
              value={`${appVersion} (${Platform.OS})`}
              isLast
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* ── Account ── */}
        <Entrance trigger={focusTick} delay={300}>
          <SettingsSection title="Account" colors={colors}>
            <SettingsRow
              type="nav"
              Icon={SignOutIcon}
              label="Sign out"
              destructive
              onPress={confirmSignOut}
              isFirst
              colors={colors}
            />
            <SettingsRow
              type="nav"
              Icon={TrashIcon}
              iconBg={colors.dangerBg}
              iconColor={colors.danger}
              label="Delete account"
              description="Permanently removes all your data"
              destructive
              onPress={handleDeleteAccount}
              isLast
              colors={colors}
            />
          </SettingsSection>
        </Entrance>

        {/* Footer note */}
        <Entrance trigger={focusTick} delay={340}>
          <View style={{ alignItems: 'center', paddingVertical: 12, gap: 4 }}>
            <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_400Regular' }}>
              Made with care in India 🇮🇳
            </Text>
            <Text style={{ color: colors.mutedFg, fontSize: 10, fontFamily: 'Inter_400Regular' }}>
              Stayoid v{appVersion}
            </Text>
          </View>
        </Entrance>
      </ScrollView>
    </SafeAreaView>
  );
}
