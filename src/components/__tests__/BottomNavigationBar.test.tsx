/**
 * BottomNavigationBar Test Suite
 * Tests for BottomNavigationBar component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNavigationBar from '../BottomNavigationBar';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
  };
});

describe('BottomNavigationBar', () => {
  const mockNavigate = jest.fn();
  const mockRoute = {
    params: {},
    name: 'UserDashboard',
    key: 'test-key',
  };

  const mockNavItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    });
    (useRoute as jest.Mock).mockReturnValue(mockRoute);
  });

  describe('Rendering', () => {
    it('should render BottomNavigationBar without crashing', () => {
      const result = render(<BottomNavigationBar items={mockNavItems} />);
      
      expect(result).toBeTruthy();
    });

    it('should render navigation items', () => {
      const { UNSAFE_getAllByType } = render(<BottomNavigationBar items={mockNavItems} />);
      
      // Should render TouchableOpacity items for each nav item
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      expect(touchables.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Navigation', () => {
    it('should navigate when navigation item is pressed', () => {
      const { UNSAFE_getAllByType } = render(<BottomNavigationBar items={mockNavItems} />);
      
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      
      // Press first item (Home)
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockNavigate).toHaveBeenCalledWith('UserDashboard');
      }
    });

    it('should navigate to correct routes', () => {
      const { UNSAFE_getAllByType } = render(<BottomNavigationBar items={mockNavItems} />);
      
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      
      // Test navigation for each item
      if (touchables.length >= 4) {
        // Test Chat navigation
        fireEvent.press(touchables[1]);
        expect(mockNavigate).toHaveBeenCalledWith('ChatList');
        
        // Test Calendar navigation
        fireEvent.press(touchables[2]);
        expect(mockNavigate).toHaveBeenCalledWith('Calendar');
        
        // Test Profile navigation
        fireEvent.press(touchables[3]);
        expect(mockNavigate).toHaveBeenCalledWith('Profile');
      }
    });
  });

  describe('Active State', () => {
    it('should render component correctly', () => {
      const result = render(<BottomNavigationBar items={mockNavItems} />);
      
      expect(result).toBeTruthy();
    });
  });
});

