// This file runs AFTER moduleNameMapper has mapped react-native to react-native-web
// CRITICAL: Patch detectHostComponentNames BEFORE any tests run

// Fixed host component names to skip detection
const fixedHostComponentNames = {
  text: 'Text',
  textInput: 'TextInput',
  view: 'View',
  scrollView: 'ScrollView',
  image: 'Image',
  touchableOpacity: 'TouchableOpacity',
  touchableHighlight: 'TouchableHighlight',
  touchableWithoutFeedback: 'TouchableWithoutFeedback',
  pressable: 'Pressable',
};

// Configure @testing-library/react-native to skip host component detection
// This must be done before any render() calls
try {
  const { configure } = require('@testing-library/react-native');
  configure({
    hostComponentNames: fixedHostComponentNames,
  });
} catch (e) {
  console.warn('Could not configure @testing-library/react-native:', e.message);
}

// Patch the internal helpers module to skip detection
try {
  const helpersPath = require.resolve('@testing-library/react-native/src/helpers/host-component-names');
  delete require.cache[helpersPath];
  const helpersModule = require(helpersPath);
  
  // Override detectHostComponentNames to return fixed values without accessing renderer
  if (helpersModule && typeof helpersModule.detectHostComponentNames === 'function') {
    helpersModule.detectHostComponentNames = function() {
      return fixedHostComponentNames;
    };
  }
  
  // Override getHostComponentNames
  if (helpersModule && typeof helpersModule.getHostComponentNames === 'function') {
    helpersModule.getHostComponentNames = function() {
      // Try to get from config first
      try {
        const configPath = require.resolve('@testing-library/react-native/src/config');
        delete require.cache[configPath];
        const configModule = require(configPath);
        if (configModule && typeof configModule.getConfig === 'function') {
          const configValue = configModule.getConfig();
          if (configValue && configValue.hostComponentNames) {
            return configValue.hostComponentNames;
          }
        }
      } catch (e) {
        // Ignore config errors
      }
      
      return fixedHostComponentNames;
    };
  }
} catch (e) {
  console.warn('Could not patch detectHostComponentNames helpers:', e.message);
}

// Also patch the config module directly
try {
  const configPath = require.resolve('@testing-library/react-native/src/config');
  delete require.cache[configPath];
  const configModule = require(configPath);
  
  // Set host component names in config
  if (configModule && typeof configModule.configureInternal === 'function') {
    configModule.configureInternal({
      hostComponentNames: fixedHostComponentNames,
    });
  } else if (configModule && configModule.defaultConfig) {
    configModule.defaultConfig.hostComponentNames = fixedHostComponentNames;
  }
} catch (e) {
  // Ignore if config patching fails
}

// Override react-native APIs that react-native-web might not fully implement
const RN = require('react-native'); // This will now resolve to react-native-web

// Override Platform
RN.Platform = {
  OS: 'ios',
  select: jest.fn((dict) => dict.ios || dict.default),
  Version: 14,
};

// Override PixelRatio if it doesn't exist or needs mocking
if (!RN.PixelRatio || typeof RN.PixelRatio.get !== 'function') {
  RN.PixelRatio = {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size),
    roundToNearestPixel: jest.fn((size) => size),
  };
}

// Override Dimensions if it doesn't exist or needs mocking
if (!RN.Dimensions || typeof RN.Dimensions.get !== 'function') {
  RN.Dimensions = {
    get: jest.fn((dimension) => ({
      width: 390,
      height: 844,
      scale: 2,
      fontScale: 1,
    })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

// Add missing APIs
if (!RN.Alert) {
  RN.Alert = {
    alert: jest.fn(),
    prompt: jest.fn(),
  };
}

if (!RN.AppRegistry) {
  RN.AppRegistry = {
    registerComponent: jest.fn(),
  };
}

if (!RN.Linking) {
  RN.Linking = {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
}

if (!RN.BackHandler) {
  RN.BackHandler = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    exitApp: jest.fn(),
  };
}

if (!RN.TurboModuleRegistry) {
  RN.TurboModuleRegistry = {
    get: jest.fn(),
    getEnforcing: jest.fn(() => ({})),
  };
}

if (!RN.NativeModules) {
  RN.NativeModules = {};
}

if (!RN.DeviceEventEmitter) {
  RN.DeviceEventEmitter = {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
  };
}

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
