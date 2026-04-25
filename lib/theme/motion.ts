import { Easing } from 'react-native-reanimated';

export const ease = {
  standard: { duration: 400, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  smooth:   { duration: 600, easing: Easing.bezier(0.25, 0.10, 0.25, 1.00) },
  enter:    { duration: 550, easing: Easing.bezier(0.25, 0.10, 0.25, 1.00) },
} as const;
