import {
  Component, type ErrorInfo, type ReactNode,
} from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { WarningOctagonIcon, ArrowClockwiseIcon } from 'phosphor-react-native';
import { logger } from '../../lib/utils/logger';
import { THEME } from '../../lib/theme';
import { APP_META } from '../../lib/constants/app-meta';
import { Linking } from 'react-native';

const log = logger('error-boundary');

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches uncaught render-time errors below it and shows a fallback screen
 * instead of whitescreening the app. Logs to our `logger` so the error reaches
 * the dev console (and any future Sentry sink).
 *
 * Mounted at the root in `app/_layout.tsx`.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    log.error('uncaught render error', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  reset = () => {
    this.setState({ error: null });
  };

  reportEmail = () => {
    const subject = encodeURIComponent(`${APP_META.name} crash report`);
    const body = encodeURIComponent(
      `App version: ${APP_META.version}\n\nWhat were you doing when it crashed?\n\n\n--- error ---\n${this.state.error?.message ?? ''}\n\n${this.state.error?.stack ?? ''}`,
    );
    Linking.openURL(`mailto:${APP_META.supportEmail}?subject=${subject}&body=${body}`);
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    // We can't useColorScheme inside a class — read once on each render. The
    // boundary is rare enough that we accept a stale theme.
    const palette = THEME.light;

    return (
      <View style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingTop: 80,
            alignItems: 'center',
            minHeight: '100%',
          }}
        >
          <View
            style={{
              width: 64, height: 64, borderRadius: 16,
              backgroundColor: palette.destructiveBg,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <WarningOctagonIcon size={32} color={palette.destructive} weight="fill" />
          </View>

          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: palette.foreground,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            Something broke
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: palette.mutedForeground,
              textAlign: 'center',
              lineHeight: 19,
              marginBottom: 24,
              maxWidth: 320,
            }}
          >
            The app hit an unexpected error. Tap retry below — if this keeps
            happening, please send us a report.
          </Text>

          <View
            style={{
              backgroundColor: palette.muted,
              borderRadius: 10,
              padding: 12,
              width: '100%',
              maxWidth: 480,
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11,
                color: palette.mutedForeground,
                marginBottom: 4,
              }}
            >
              Error
            </Text>
            <Text
              selectable
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: palette.foreground,
                lineHeight: 17,
              }}
            >
              {error.message || String(error)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, width: '100%', maxWidth: 320 }}>
            <Pressable
              onPress={this.reset}
              android_ripple={null}
              style={{
                flex: 1,
                backgroundColor: palette.primary,
                borderRadius: 10,
                paddingVertical: 13,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ArrowClockwiseIcon size={14} color="#fff" weight="bold" />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: '#fff',
                }}
              >
                Try again
              </Text>
            </Pressable>
            <Pressable
              onPress={this.reportEmail}
              android_ripple={null}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.card,
                borderRadius: 10,
                paddingVertical: 13,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 13,
                  color: palette.foreground,
                }}
              >
                Send report
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }
}
