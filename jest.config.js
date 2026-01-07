module.exports = {
  // Sử dụng jsdom cho React Native Testing Library
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['babel-preset-expo'],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-gifted-chat|react-native-calendars|@expo/vector-icons|react-native-web)',
  ],
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.after.js', '@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    // Chỉ tính coverage cho các file đã có test
    'src/screens/LoginScreen.tsx',
    'src/screens/OnboardingScreen.tsx',
    'src/screens/user/UserDashboard.tsx',
    'src/screens/user/MoodCheckInScreen.tsx',
    'src/components/CustomButton.tsx',
    'src/components/MoodSelector.tsx',
    'src/components/BottomNavigationBar.tsx',
    'src/constants/**/*.{ts,tsx}',
    'src/config/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map react-native to react-native-web so react-test-renderer can render components
    // This is needed for detectHostComponentNames to work correctly
    '^react-native$': 'react-native-web',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}', '**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  globals: {
    __DEV__: true,
  },
};
