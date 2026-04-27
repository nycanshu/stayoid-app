import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { useColors } from '../../../lib/hooks/use-colors';
import { PropertyForm } from '../../../components/properties/PropertyForm';
import { Entrance } from '../../../components/animations';

export default function NewPropertyScreen() {
  const colors = useColors();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
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
              Add Property
            </Text>
            <Text style={{
              color: colors.mutedFg, fontSize: 13,
              fontFamily: 'Inter_400Regular', marginTop: 2,
            }}>
              Create a new PG or flat to manage
            </Text>
          </Entrance>

          {/* ── Form (with built-in preview + actions) ── */}
          <Entrance trigger={1} delay={60}>
            <PropertyForm
              mode="create"
              onSuccess={(slug) => router.replace(`/(tabs)/properties/${slug}`)}
              onCancel={() => router.back()}
              colors={colors}
            />
          </Entrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
