import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../../lib/stores/auth-store';

interface MenuRowProps {
  icon: string;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuRow({ icon, label, onPress, destructive }: MenuRowProps) {
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 }}
      onPress={onPress}
    >
      <Text style={{ fontSize: 18, width: 24 }}>{icon}</Text>
      <Text style={{ flex: 1, color: destructive ? '#EF4444' : '#FAFAFA', fontSize: 15 }}>{label}</Text>
      {!destructive && <Text style={{ color: '#A3A3A3' }}>›</Text>}
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      <Text style={{ color: '#FAFAFA', fontSize: 20, fontFamily: 'Inter_600SemiBold', paddingHorizontal: 16, paddingVertical: 16 }}>
        More
      </Text>

      {/* Profile */}
      <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, marginHorizontal: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#4F9D7E', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>
            {user?.name?.[0] ?? '?'}
          </Text>
        </View>
        <View>
          <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>{user?.name ?? 'User'}</Text>
          <Text style={{ color: '#A3A3A3', fontSize: 13 }}>{user?.email}</Text>
        </View>
      </View>

      {/* Management */}
      <Text style={{ color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginHorizontal: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Management</Text>
      <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}>
        <MenuRow icon="👥" label="Tenants" onPress={() => router.push('/(tabs)/more/tenants')} />
      </View>

      {/* Account */}
      <Text style={{ color: '#A3A3A3', fontSize: 12, fontFamily: 'Inter_600SemiBold', marginHorizontal: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Account</Text>
      <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' }}>
        <MenuRow icon="🎨" label="Appearance" onPress={() => router.push('/(tabs)/more/settings')} />
        <View style={{ height: 1, backgroundColor: '#272727', marginLeft: 52 }} />
        <MenuRow icon="🔒" label="Settings" onPress={() => router.push('/(tabs)/more/settings')} />
      </View>

      {/* App */}
      <View style={{ backgroundColor: '#181818', borderWidth: 1, borderColor: '#272727', borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' }}>
        <MenuRow icon="🚪" label="Log Out" onPress={handleLogout} destructive />
      </View>
    </SafeAreaView>
  );
}
