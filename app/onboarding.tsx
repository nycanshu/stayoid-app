import {
  View, Text, FlatList, Dimensions, Pressable,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import {
  HouseIcon, UsersIcon, CurrencyInrIcon, ArrowRightIcon,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StayoidLogo } from '../components/shared/StayoidLogo';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

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
    subtitle: "Track who paid, who hasn't. Generate receipts and monthly reports instantly. Free to start, no setup fee.",
  },
];

async function markOnboardingSeen() {
  await AsyncStorage.setItem('onboarding_seen', 'true');
}

type Slide = (typeof SLIDES)[0];

// ─── Animated slide ──────────────────────────────────────────────────────────

function AnimatedSlide({ item, isActive }: { item: Slide; isActive: boolean }) {
  const { Icon } = item;

  // entrance
  const iconOpacity = useSharedValue(0);
  const iconY = useSharedValue(28);
  const labelOpacity = useSharedValue(0);
  const labelY = useSharedValue(16);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(22);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(14);

  // loops
  const floatY = useSharedValue(0);
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      // staggered entrance
      iconOpacity.value = withTiming(1, { duration: 560 });
      iconY.value = withSpring(0, { damping: 14, stiffness: 90 });

      labelOpacity.value = withDelay(180, withTiming(1, { duration: 380 }));
      labelY.value = withDelay(180, withSpring(0, { damping: 15, stiffness: 110 }));

      titleOpacity.value = withDelay(300, withTiming(1, { duration: 420 }));
      titleY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 90 }));

      subtitleOpacity.value = withDelay(440, withTiming(1, { duration: 380 }));
      subtitleY.value = withDelay(440, withSpring(0, { damping: 15, stiffness: 110 }));

      // icon floating after entrance settles
      floatY.value = withDelay(
        680,
        withRepeat(
          withSequence(
            withTiming(-9, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );

      // ring 1 — slow breathe
      ring1Scale.value = withDelay(
        700,
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );

      // ring 2 — offset phase breathe
      ring2Scale.value = withDelay(
        1350,
        withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        )
      );
    } else {
      cancelAnimation(floatY);
      cancelAnimation(ring1Scale);
      cancelAnimation(ring2Scale);

      // snap-reset so next entrance is clean
      iconOpacity.value = 0;
      iconY.value = 28;
      labelOpacity.value = 0;
      labelY.value = 16;
      titleOpacity.value = 0;
      titleY.value = 22;
      subtitleOpacity.value = 0;
      subtitleY.value = 14;
      floatY.value = 0;
      ring1Scale.value = 1;
      ring2Scale.value = 1;
    }
  }, [isActive]);

  const iconWrapStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ translateY: iconY.value + floatY.value }],
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleY.value }],
  }));

  return (
    <View style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
      {/* Icon with animated rings */}
      <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', marginBottom: 44 }, iconWrapStyle]}>
        <Animated.View style={[{
          width: 196, height: 196, borderRadius: 98,
          backgroundColor: `${item.color}08`,
          alignItems: 'center', justifyContent: 'center',
        }, ring1Style]}>
          <Animated.View style={[{
            width: 152, height: 152, borderRadius: 76,
            backgroundColor: `${item.color}12`,
            alignItems: 'center', justifyContent: 'center',
          }, ring2Style]}>
            <View style={{
              width: 112, height: 112, borderRadius: 56,
              backgroundColor: `${item.color}20`,
              borderWidth: 1, borderColor: `${item.color}40`,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={44} color={item.color} weight="duotone" />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.Text style={[{
        color: item.color, fontSize: 10, fontFamily: 'Inter_600SemiBold',
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
      }, labelStyle]}>
        {item.label}
      </Animated.Text>

      <Animated.Text style={[{
        color: '#FAFAFA', fontSize: 28,
        fontFamily: 'SpaceGrotesk_700Bold',
        textAlign: 'center', lineHeight: 34, marginBottom: 14, letterSpacing: -0.5, paddingRight: 0.5,
      }, titleStyle]}>
        {item.title}
      </Animated.Text>

      <Animated.Text style={[{
        color: '#A3A3A3', fontSize: 15,
        fontFamily: 'Inter_400Regular',
        textAlign: 'center', lineHeight: 23,
      }, subtitleStyle]}>
        {item.subtitle}
      </Animated.Text>
    </View>
  );
}

// ─── Animated dot ─────────────────────────────────────────────────────────────

function AnimatedDot({ isActive }: { isActive: boolean }) {
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    width: 6 + progress.value * 18,  // 6 → 24
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#272727', '#4F9D7E']),
  }));

  return <Animated.View style={[{ height: 6, borderRadius: 3 }, dotStyle]} />;
}

// ─── Animated button ─────────────────────────────────────────────────────────

function AnimatedButton({
  onPress, style, children,
}: {
  onPress: () => void;
  style: object;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 14, stiffness: 220 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 12, stiffness: 180 }); }}
        android_ripple={null}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
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
      <StatusBar style="light" />
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StayoidLogo size={28} />
          <Text style={{ color: '#FAFAFA', fontSize: 16, fontFamily: 'SpaceGrotesk_700Bold', letterSpacing: -0.3, paddingRight: 0.3 }}>
            Stayoid
          </Text>
        </View>
        {!isLast && (
          <Pressable onPress={goToLogin} android_ripple={null}>
            <Text style={{ color: '#A3A3A3', fontSize: 14, fontFamily: 'Inter_400Regular' }}>Skip</Text>
          </Pressable>
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
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => (
          <AnimatedSlide item={item} isActive={index === activeIndex} />
        )}
      />

      {/* Dot indicators */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
        {SLIDES.map((_, i) => (
          <AnimatedDot key={i} isActive={i === activeIndex} />
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
            <AnimatedButton
              onPress={goToSignup}
              style={{ backgroundColor: '#4F9D7E', borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Create Account — It's Free
              </Text>
            </AnimatedButton>
            <AnimatedButton
              onPress={goToLogin}
              style={{ backgroundColor: 'transparent', borderRadius: 14, borderWidth: 1, borderColor: '#272727', paddingVertical: 15, alignItems: 'center' }}
            >
              <Text style={{ color: '#FAFAFA', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>
                Log In
              </Text>
            </AnimatedButton>
          </>
        ) : (
          <AnimatedButton
            onPress={goNext}
            style={{
              backgroundColor: '#4F9D7E', borderRadius: 14, paddingVertical: 15,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' }}>Next</Text>
            <ArrowRightIcon size={16} color="#fff" />
          </AnimatedButton>
        )}
      </View>
    </SafeAreaView>
  );
}
