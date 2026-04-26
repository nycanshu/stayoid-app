import { useColorScheme } from 'react-native';
import { LIGHT, DARK } from '../theme/colors';
import { useThemeStore } from '../stores/theme-store';

export function useColors() {
  const systemScheme = useColorScheme();
  const preference   = useThemeStore((s) => s.preference);
  const effective    = preference === 'system' ? systemScheme : preference;
  return effective === 'dark' ? DARK : LIGHT;
}
