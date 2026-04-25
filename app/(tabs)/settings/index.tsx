import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  UserIcon, UsersIcon, ShieldCheckIcon, SignOutIcon,
  CaretRightIcon, GearSixIcon,
} from 'phosphor-react-native';
import { useAuthStore } from '../../../lib/stores/auth-store';
import { useColors } from '../../../lib/hooks/use-colors';
import { Avatar } from '../../../components/ui';

function SettingsRow({
  Icon, label, onPress, destructive, colors,
}: {
  Icon: React.FC<{ size: number; color: string }>;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}
    >
      <Icon size={18} color={destructive ? colors.danger : colors.mutedFg} />
      <Text style={{
        flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular',
        color: destructive ? colors.danger : colors.foreground,
      }}>
        {label}
      </Text>
      {!destructive && <CaretRightIcon size={16} color={colors.mutedFg} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Text style={{ color: colors.foreground, fontSize: 20, fontFamily: 'Inter_600SemiBold' }}>
          Settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile card */}
        {user && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            marginHorizontal: 16, marginBottom: 20,
            backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
            borderRadius: 12, padding: 16,
          }}>
            <Avatar name={user.name ?? 'U'} size="lg" />
            <View>
              <Text style={{ color: colors.foreground, fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                {user.name}
              </Text>
              <Text style={{ color: colors.mutedFg, fontSize: 13, marginTop: 2 }}>
                {user.email}
              </Text>
            </View>
          </View>
        )}

        {/* Account section */}
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 4 }}>
          Account
        </Text>
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}>
          <SettingsRow Icon={UserIcon} label="Edit Profile" onPress={() => {}} colors={colors} />
          <SettingsRow Icon={ShieldCheckIcon} label="Security" onPress={() => {}} colors={colors} />
        </View>

        {/* Data section */}
        <Text style={{ color: colors.mutedFg, fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 4 }}>
          Data
        </Text>
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}>
          <SettingsRow
            Icon={UsersIcon}
            label="All Tenants"
            onPress={() => router.push('/(tabs)/more/tenants')}
            colors={colors}
          />
        </View>

        {/* Danger section */}
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' }}>
          <SettingsRow Icon={SignOutIcon} label="Log Out" onPress={handleLogout} destructive colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
