import { useColorScheme } from 'react-native';
import { LIGHT, DARK } from '../theme/colors';

export function useColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK : LIGHT;
}
