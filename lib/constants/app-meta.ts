import Constants from 'expo-constants';

export const APP_META = {
  name: 'Stayoid',
  version: (Constants.expoConfig?.version as string | undefined) ?? '1.0.0',
  supportEmail: 'hello.stayoid@gmail.com',
  marketingUrl: 'https://stayoid.com',
  appStore: {
    ios: 'https://apps.apple.com/app/stayoid',
    android: 'https://play.google.com/store/apps/details?id=com.stayoid.app',
  },
  policies: {
    lastUpdated: 'April 2026',
    responseSla: '48 hours',
  },
  copyrightYear: 2026,
} as const;

export function mailto(subjectSuffix: string): string {
  const subject = encodeURIComponent(`${APP_META.name} ${subjectSuffix}`);
  return `mailto:${APP_META.supportEmail}?subject=${subject}`;
}
