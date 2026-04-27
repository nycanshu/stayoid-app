import { View, Text } from 'react-native';

interface GreetingProps {
  firstName?: string;
}

export function Greeting({ firstName }: GreetingProps) {
  return (
    <View>
      <Text
        className="text-foreground text-[22px] tracking-tight"
        style={{ fontFamily: 'Inter_600SemiBold', paddingRight: 0.3 }}
      >
        Welcome back{firstName ? `, ${firstName}` : ''}
      </Text>
      <Text
        className="text-muted-foreground text-[13px] mt-0.5"
        style={{ fontFamily: 'Inter_400Regular' }}
      >
        Here's your portfolio overview
      </Text>
    </View>
  );
}
