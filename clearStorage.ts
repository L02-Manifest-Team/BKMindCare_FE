// Quick script to clear all AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All storage cleared!');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Call this from your app
clearAllStorage();
