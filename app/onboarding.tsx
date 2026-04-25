import {
  View, Text, TouchableOpacity, FlatList, Dimensions,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  HouseIcon, UsersIcon, CurrencyInrIcon, ArrowRightIcon,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StayoidLogo } from '../components/shared/StayoidLogo';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    Icon: HouseIcon,
    color: '#4F9D7E',
    label: 'PROPERTY MANAGEMENT',
    title: 'One Dashboard.\nZero Confusion.',
    subtitle: 'Manage rooms, tenants, rent & dues — all in one place. Built for PG owners, hoteliers and landlords across India.',
  },
  {
    id: '2',
    Icon: UsersIcon,
    color: '#9B9FCE',
    label: 'TENANT MANAGEMENT',
    title: 'Onboard tenants\nthe right way.',
    subtitle: 'Invite tenants digitally, store documents, and track every move-in & move-out. No paperwork. No WhatsApp chaos.',
  },
  {
    id: '3',
    Icon: CurrencyInrIcon,
    color: '#E8D4B8',
    label: 'RENT COLLECTION',
    title: 'Collect rent\non autopilot.',
    subtitle: 'Track who paid, who hasn\'t. Generate receipts and monthly reports instantly. Free to start, no setup fee.',
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
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StayoidLogo size={28} />
          <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3 }}>
            Stayoid
          </Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={goToLogin}>
            <Text style={{ color: '#A3A3A3', fontSize: 14, fontFamily: 'Inter_400Regular' }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

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
        style={{ flex: 1 }}
        renderItem={({ item }) => {
          const { Icon } = item;
          return (
            <View style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              {/* Icon with concentric glow rings */}
              <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 44 }}>
                <View style={{ width: 196, height: 196, borderRadius: 98, backgroundColor: `${item.color}08`, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 152, height: 152, borderRadius: 76, backgroundColor: `${item.color}12`, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                      width: 112, height: 112, borderRadius: 56,
                      backgroundColor: `${item.color}20`,
                      borderWidth: 1, borderColor: `${item.color}40`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={44} color={item.color} weight="duotone" />
                    </View>
                  </View>
                </View>
              </View>

              <Text style={{
                color: item.color, fontSize: 10, fontFamily: 'Inter_600SemiBold',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
              }}>
                {item.label}
              </Text>
              <Text style={{
                color: '#FAFAFA', fontSize: 28,
                fontFamily: 'SpaceGrotesk_700Bold',
                textAlign: 'center', lineHeight: 34, marginBottom: 14, letterSpacing: -0.5,
              }}>
                {item.title}
              </Text>
              <Text style={{
                color: '#A3A3A3', fontSize: 15,
                fontFamily: 'Inter_400Regular',
                textAlign: 'center', lineHeight: 23,
              }}>
                {item.subtitle}
              </Text>
            </View>
          );
        }}
      />

      {/* Dot indicator */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
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

      {/* Stats strip */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Text style={{ color: '#525252', fontSize: 11, fontFamily: 'Inter_400Regular' }}>500+ Owners</Text>
        <View style={{ width: 1, height: 10, backgroundColor: '#272727' }} />
        <Text style={{ color: '#525252', fontSize: 11, fontFamily: 'Inter_400Regular' }}>Across India</Text>
        <View style={{ width: 1, height: 10, backgroundColor: '#272727' }} />
        <Text style={{ color: '#525252', fontSize: 11, fontFamily: 'Inter_400Regular' }}>Free to Start</Text>
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 10 }}>
        {isLast ? (
          <>
            <TouchableOpacity
              onPress={goToSignup}
              style={{ backgroundColor: '#4F9D7E', borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Create Account — It's Free
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToLogin}
              style={{ backgroundColor: 'transparent', borderRadius: 14, borderWidth: 1, borderColor: '#272727', paddingVertical: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Log In
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={goNext}
            style={{
              backgroundColor: '#4F9D7E', borderRadius: 14, paddingVertical: 15,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Next</Text>
            <ArrowRightIcon size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
