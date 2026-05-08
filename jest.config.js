/**
 * Jest config for pure-logic unit tests (Layer 1).
 * No RN component rendering — we test formatters, error mapping, validators,
 * and the api-client refresh logic. Component/E2E coverage lives elsewhere.
 */
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  // jest-expo's default transformIgnorePatterns already covers expo + RN modules.
  // We only test pure-logic files, but client.ts imports expo-secure-store which
  // gets mocked in jest.setup.ts.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // @react-navigation/native is nested under expo-router's tree; resolve to
    // a flat stub for tests that import lib/theme.ts.
    '^@react-navigation/native$': '<rootDir>/__mocks__/react-navigation-native.ts',
  },
  // Keep timers real by default; tests opt into fake timers when needed.
  testEnvironment: 'node',
};
