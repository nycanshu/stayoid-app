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
import { useColorScheme } from 'nativewind';
import { StayoidLogo } from '../components/shared/StayoidLogo';
import { THEME } from '../lib/theme';
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

function AnimatedSlide({ item, isActive }: { item: Slide; isActive: boolean }) {
  const { Icon } = item;

  const iconOpacity = useSharedValue(0);
  const iconY = useSharedValue(28);
  const labelOpacity = useSharedValue(0);
  const labelY = useSharedValue(16);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(22);
  const subtitleOpacity = useSharedValue(0);
  const subtitleY = useSharedValue(14);

  const floatY = useSharedValue(0);
  const ring1Scale = useSharedValue(1);
  const ring2Scale = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      iconOpacity.value = withTiming(1, { duration: 560 });
      iconY.value = withSpring(0, { damping: 14, stiffness: 90 });

      labelOpacity.value = withDelay(180, withTiming(1, { duration: 380 }));
      labelY.value = withDelay(180, withSpring(0, { damping: 15, stiffness: 110 }));

      titleOpacity.value = withDelay(300, withTiming(1, { duration: 420 }));
      titleY.value = withDelay(300, withSpring(0, { damping: 14, stiffness: 90 }));

      subtitleOpacity.value = withDelay(440, withTiming(1, { duration: 380 }));
      subtitleY.value = withDelay(440, withSpring(0, { damping: 15, stiffness: 110 }));

      floatY.value = withDelay(680,
        withRepeat(
          withSequence(
            withTiming(-9, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.ease) })
          ), -1, false
        )
      );
      ring1Scale.value = withDelay(700,
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
          ), -1, false
        )
      );
      ring2Scale.value = withDelay(1350,
        withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
          ), -1, false
        )
      );
    } else {
      cancelAnimation(floatY);
      cancelAnimation(ring1Scale);
      cancelAnimation(ring2Scale);

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
  const ring1Style = useAnimatedStyle(() => ({ transform: [{ scale: ring1Scale.value }] }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }] }));
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
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <Animated.View style={iconWrapStyle} className="items-center justify-center mb-11">
        <Animated.View
          style={[{ backgroundColor: `${item.color}08`, width: 196, height: 196, borderRadius: 98 }, ring1Style]}
          className="items-center justify-center"
        >
          <Animated.View
            style={[{ backgroundColor: `${item.color}12`, width: 152, height: 152, borderRadius: 76 }, ring2Style]}
            className="items-center justify-center"
          >
            <View
              style={{
                backgroundColor: `${item.color}20`,
                borderColor: `${item.color}40`,
                width: 112, height: 112, borderRadius: 56,
                borderWidth: 1,
              }}
              className="items-center justify-center"
            >
              <Icon size={44} color={item.color} weight="duotone" />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.Text
        style={[{ color: item.color, paddingRight: 0.3 }, labelStyle]}
        className="text-[10px] tracking-[2px] uppercase mb-3"
      >
        <Text style={{ fontFamily: 'Inter_600SemiBold' }}>{item.label}</Text>
      </Animated.Text>

      <Animated.Text
        style={[{ paddingRight: 0.5 }, titleStyle]}
        className="text-foreground text-[28px] text-center mb-3.5 leading-[34px] tracking-tight"
      >
        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>{item.title}</Text>
      </Animated.Text>

      <Animated.Text
        style={subtitleStyle}
        className="text-muted-foreground text-[15px] text-center leading-[23px]"
      >
        <Text style={{ fontFamily: 'Inter_400Regular' }}>{item.subtitle}</Text>
      </Animated.Text>
    </View>
  );
}

function AnimatedDot({ isActive }: { isActive: boolean }) {
  const { colorScheme } = useColorScheme();
  const palette = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    width: 6 + progress.value * 18,
    backgroundColor: interpolateColor(progress.value, [0, 1], [palette.muted, palette.primary]),
  }));

  return <Animated.View style={[{ height: 6, borderRadius: 3 }, dotStyle]} />;
}

function AnimatedButton({
  onPress, className, children,
}: {
  onPress: () => void;
  className?: string;
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
        className={className}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="flex-row items-center justify-between px-5 py-3">
        <View className="flex-row items-center gap-2">
          <StayoidLogo size={28} />
          <Text
            className="text-foreground text-base tracking-tight"
            style={{ fontFamily: 'SpaceGrotesk_700Bold', paddingRight: 0.3 }}
          >
            Stayoid
          </Text>
        </View>
        {!isLast && (
          <Pressable onPress={goToLogin} android_ripple={null}>
            <Text
              className="text-muted-foreground text-sm"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Skip
            </Text>
          </Pressable>
        )}
      </View>

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

      <View className="flex-row justify-center gap-1.5 mb-5">
        {SLIDES.map((_, i) => (
          <AnimatedDot key={i} isActive={i === activeIndex} />
        ))}
      </View>

      <View className="flex-row justify-center items-center gap-3 mb-5">
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          500+ Owners
        </Text>
        <View className="w-px h-2.5 bg-border" />
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Across India
        </Text>
        <View className="w-px h-2.5 bg-border" />
        <Text
          className="text-muted-foreground text-[11px]"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          Free to Start
        </Text>
      </View>

      <View className="px-6 pb-6 gap-2.5">
        {isLast ? (
          <>
            <AnimatedButton
              onPress={goToSignup}
              className="bg-primary rounded-2xl py-[15px] items-center"
            >
              <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Create Account — It's Free
              </Text>
            </AnimatedButton>
            <AnimatedButton
              onPress={goToLogin}
              className="bg-transparent border border-border rounded-2xl py-[15px] items-center"
            >
              <Text className="text-foreground text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Log In
              </Text>
            </AnimatedButton>
          </>
        ) : (
          <AnimatedButton
            onPress={goNext}
            className="bg-primary rounded-2xl py-[15px] flex-row items-center justify-center gap-2"
          >
            <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_600SemiBold' }}>Next</Text>
            <ArrowRightIcon size={16} color="#fff" />
          </AnimatedButton>
        )}
      </View>
    </SafeAreaView>
  );
}
