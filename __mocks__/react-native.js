// Manual mock cho react-native để export Dimensions đúng cách
const mockDimensionsValue = {
  width: 390,
  height: 844,
  scale: 2,
  fontScale: 1,
};

const Dimensions = {
  get: jest.fn((dimension) => {
    if (dimension === 'window' || dimension === 'screen') {
      return mockDimensionsValue;
    }
    return mockDimensionsValue;
  }),
  set: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const Platform = {
  OS: 'ios',
  Version: 14,
  select: jest.fn((obj) => obj.ios || obj.default),
};

const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size) => size),
  roundToNearestPixel: jest.fn((size) => size),
};

// Mock các React Native components
const React = require('react');

const View = (props) => React.createElement('View', props);
const Text = (props) => React.createElement('Text', props);
const ScrollView = (props) => React.createElement('ScrollView', props);
const TouchableOpacity = (props) => React.createElement('TouchableOpacity', props);
const Image = (props) => React.createElement('Image', props);
const FlatList = (props) => React.createElement('FlatList', props);
const SectionList = (props) => React.createElement('SectionList', props);
const TextInput = (props) => React.createElement('TextInput', props);

module.exports = {
  Dimensions,
  Platform,
  PixelRatio,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  SectionList,
  TextInput,
  StyleSheet: {
    create: (styles) => styles,
  },
  // Thêm các exports khác nếu cần
  NativeModules: {},
  Animated: {
    View: View,
    Text: Text,
    Value: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
  },
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
  },
};

