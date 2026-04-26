import { View, Text } from 'react-native';
import type { AppColors } from '../../lib/theme/colors';

interface GreetingProps {
  firstName?: string;
  colors: AppColors;
}

/** "Welcome back, X" + subtitle. Top-of-dashboard greeting card (no border). */
export function Greeting({ firstName, colors }: GreetingProps) {
  return (
    <View>
      <Text style={{
        color: colors.foreground,
        fontSize: 22, fontFamily: 'Inter_600SemiBold',
        letterSpacing: -0.3, paddingRight: 0.3,
      }}>
        Welcome back{firstName ? `, ${firstName}` : ''}
      </Text>
      <Text style={{
        color: colors.mutedFg, fontSize: 13,
        fontFamily: 'Inter_400Regular', marginTop: 2,
      }}>
        Here's your portfolio overview
      </Text>
    </View>
  );
}
