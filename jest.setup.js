// Jest setup file - Mock third-party libraries that are not compatible with JSDOM or react-native-web
// This file runs BEFORE moduleNameMapper has mapped react-native to react-native-web

// Mock expo-modules-core BEFORE anything else
jest.mock('expo-modules-core', () => ({
  EventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  })),
}));

// NOTE: react-native will be mapped to react-native-web via moduleNameMapper in jest.config.js
// This allows react-test-renderer to properly render components for detectHostComponentNames

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const Icon = ({ name, size, color, ...props }) => 
    React.createElement('Text', { ...props, testID: `icon-${name}` }, name);
  
  return {
    Ionicons: Icon,
    MaterialIcons: Icon,
    FontAwesome: Icon,
    AntDesign: Icon,
    Entypo: Icon,
    Feather: Icon,
    MaterialCommunityIcons: Icon,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    default: {
      View: View,
      Text: Text,
      call: jest.fn(),
    },
    View: View,
    Text: Text,
    Value: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    call: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
    },
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }) => React.createElement(View, props, children),
  };
});

// Mock @react-navigation/core (used internally by @react-navigation/native)
jest.mock('@react-navigation/core', () => {
  const mockRoute = {
    params: {},
    name: 'UserDashboard',
    key: 'test-route-key',
  };
  
  return {
    useRoute: () => mockRoute,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: jest.fn(() => false),
      reset: jest.fn(),
      replace: jest.fn(),
    }),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      current: null,
    })),
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const mockRoute = {
    params: {},
    name: 'UserDashboard',
    key: 'test-route-key',
  };
  
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
      canGoBack: jest.fn(() => false),
      reset: jest.fn(),
      replace: jest.fn(),
    }),
    useRoute: () => mockRoute,
    useFocusEffect: jest.fn(),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      current: null,
    })),
  };
});

// Mock react-native-calendars
jest.mock('react-native-calendars', () => ({
  Calendar: 'Calendar',
  CalendarList: 'CalendarList',
  Agenda: 'Agenda',
}));

// Mock react-native-gifted-chat
jest.mock('react-native-gifted-chat', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    GiftedChat: ({ messages = [], onSend, user }) => {
      return React.createElement(View, { testID: 'gifted-chat' },
        messages.map((msg, idx) =>
          React.createElement(Text, { key: idx, testID: `message-${idx}` }, msg.text)
        )
      );
    },
  };
});

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
