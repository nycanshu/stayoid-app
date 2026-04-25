import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '../../lib/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label && (
        <Text
          className="text-[#A3A3A3] text-sm"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        className={cn(
          'bg-[#181818] border rounded-xl px-4 py-3 text-[#FAFAFA] text-sm',
          error ? 'border-[#EF4444]' : 'border-[#272727]',
          className,
        )}
        style={{ fontFamily: 'Inter_400Regular' }}
        placeholderTextColor="#A3A3A3"
      />
      {error && (
        <Text className="text-[#EF4444] text-xs" style={{ fontFamily: 'Inter_400Regular' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
