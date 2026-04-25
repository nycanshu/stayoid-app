import {
  View, Text, TouchableOpacity, FlatList, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'checkmark-circle' as const,
    iconColor: '#4F9D7E',
    title: 'Know who\'s paid\nat a glance',
    subtitle: 'See every tenant\'s payment status instantly. No spreadsheets, no guessing.',
  },
  {
    id: '2',
    icon: 'business' as const,
    iconColor: '#9B9FCE',
    title: 'All your properties\nin one place',
    subtitle: 'Manage rooms, floors, and tenants across every PG or flat you own.',
  },
  {
    id: '3',
    icon: 'rocket' as const,
    iconColor: '#E8D4B8',
    title: 'Get started free.\nNo setup fee.',
    subtitle: 'Create your account and add your first property in under 2 minutes.',
    isLast: true,
  },
];

async function markOnboardingSeen() {
  await AsyncStorage.setItem('onboarding_seen', 'true');
}

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const goToLogin = async () => {
    await markOnboardingSeen();
    router.replace('/(auth)/login');
  };

  const goToSignup = async () => {
    await markOnboardingSeen();
    router.replace('/(auth)/signup');
  };

  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
      {/* Skip */}
      {!isLast && (
        <TouchableOpacity
          onPress={goToLogin}
          style={{ alignSelf: 'flex-end', paddingHorizontal: 20, paddingVertical: 12 }}
        >
          <Text style={{ color: '#A3A3A3', fontSize: 14, fontFamily: 'Inter_500Medium' }}>Skip</Text>
        </TouchableOpacity>
      )}
      {isLast && <View style={{ height: 44 }} />}

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            {/* Icon circle */}
            <Animated.View
              entering={FadeInUp.duration(500).delay(100)}
              style={{
                width: 120, height: 120, borderRadius: 60,
                backgroundColor: `${item.iconColor}18`,
                borderWidth: 1, borderColor: `${item.iconColor}30`,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 48,
              }}
            >
              <Ionicons name={item.icon} size={52} color={item.iconColor} />
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.duration(500).delay(200)}
              style={{
                color: '#FAFAFA',
                fontSize: 30,
                fontFamily: 'PlayfairDisplay_600SemiBold',
                textAlign: 'center',
                lineHeight: 38,
                marginBottom: 16,
              }}
            >
              {item.title}
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.duration(500).delay(300)}
              style={{
                color: '#A3A3A3',
                fontSize: 16,
                fontFamily: 'Inter_400Regular',
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              {item.subtitle}
            </Animated.Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 32 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              height: 6,
              width: i === activeIndex ? 24 : 6,
              borderRadius: 3,
              backgroundColor: i === activeIndex ? '#4F9D7E' : '#272727',
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
        {isLast ? (
          <>
            <TouchableOpacity
              onPress={goToSignup}
              style={{
                backgroundColor: '#4F9D7E', borderRadius: 14,
                paddingVertical: 16, alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                Create Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToLogin}
              style={{
                backgroundColor: '#181818', borderRadius: 14, borderWidth: 1,
                borderColor: '#272727', paddingVertical: 16, alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                Log In
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={goNext}
            style={{
              backgroundColor: '#4F9D7E', borderRadius: 14,
              paddingVertical: 16, alignItems: 'center',
              flexDirection: 'row', justifyContent: 'center', gap: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
              Next
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
