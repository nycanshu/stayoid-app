/**
 * Environment-aware logger.
 *
 * - In dev (__DEV__ === true): everything goes to the JS console with a
 *   colored tag prefix and an optional payload.
 * - In prod: only `warn` and `error` are kept; `debug` and `info` are no-ops
 *   so the app stays quiet and we don't ship verbose tracing to users.
 * - `error` and `warn` always run a side-channel hook so a future Sentry/
 *   Posthog adapter can ingest them without changing call sites.
 *
 * Usage:
 *   import { logger } from '@/lib/utils/logger';
 *   const log = logger('payments');
 *   log.debug('submitting', { tenantId });
 *   log.error('record failed', err);
 *
 * Toggle dev verbosity at runtime:
 *   logger.setLevel('warn');   // silence debug/info even in dev
 *   logger.setLevel('debug');  // back to default
 *   logger.setEnabled(false);  // mute everything
 */

type Level = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_RANK: Record<Level, number> = {
  debug: 10, info: 20, warn: 30, error: 40, silent: 100,
};

interface LoggerConfig {
  enabled: boolean;
  level: Level;
  /** Optional sink for warn/error (e.g. Sentry.captureException). */
  sink?: (level: 'warn' | 'error', tag: string, msg: string, payload?: unknown) => void;
}

const config: LoggerConfig = {
  // In dev: log everything. In prod: only warn/error.
  enabled: true,
  level: __DEV__ ? 'debug' : 'warn',
};

function shouldLog(level: Level): boolean {
  if (!config.enabled) return false;
  return LEVEL_RANK[level] >= LEVEL_RANK[config.level];
}

function format(tag: string, level: Level): string {
  const t = new Date();
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  const ss = String(t.getSeconds()).padStart(2, '0');
  const ms = String(t.getMilliseconds()).padStart(3, '0');
  return `[${hh}:${mm}:${ss}.${ms}] ${level.toUpperCase().padEnd(5)} ${tag}`;
}

function emit(
  level: Level, tag: string, msg: string, payload?: unknown,
): void {
  if (!shouldLog(level)) return;
  const prefix = format(tag, level);
  const args: unknown[] = [prefix, msg];
  if (payload !== undefined) args.push(payload);

  switch (level) {
    case 'debug': console.log(...args); break;
    case 'info':  console.info(...args); break;
    case 'warn':  console.warn(...args); break;
    case 'error': console.error(...args); break;
    case 'silent': break;
  }

  if ((level === 'warn' || level === 'error') && config.sink) {
    try {
      config.sink(level, tag, msg, payload);
    } catch {
      // Sink itself failed — never let a logger break the app.
    }
  }
}

export interface ScopedLogger {
  debug: (msg: string, payload?: unknown) => void;
  info:  (msg: string, payload?: unknown) => void;
  warn:  (msg: string, payload?: unknown) => void;
  error: (msg: string, payload?: unknown) => void;
}

interface LoggerFactory {
  (tag: string): ScopedLogger;
  setLevel: (level: Level) => void;
  setEnabled: (enabled: boolean) => void;
  setSink: (sink: LoggerConfig['sink']) => void;
  getConfig: () => Readonly<LoggerConfig>;
}

const factory = ((tag: string): ScopedLogger => ({
  debug: (msg, payload) => emit('debug', tag, msg, payload),
  info:  (msg, payload) => emit('info',  tag, msg, payload),
  warn:  (msg, payload) => emit('warn',  tag, msg, payload),
  error: (msg, payload) => emit('error', tag, msg, payload),
})) as LoggerFactory;

factory.setLevel = (level) => { config.level = level; };
factory.setEnabled = (enabled) => { config.enabled = enabled; };
factory.setSink = (sink) => { config.sink = sink; };
factory.getConfig = () => config;

export const logger = factory;
