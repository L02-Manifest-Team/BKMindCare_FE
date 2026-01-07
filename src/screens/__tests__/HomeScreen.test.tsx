/**
 * HomeScreen Test Suite
 * Tests for UserDashboard screen (used as Home screen)
 * 
 * Requirements:
 * - At least 3 test cases: render, button press, không crash
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import UserDashboard from '../user/UserDashboard';
import { useNavigation } from '@react-navigation/native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(() => ({
    params: {},
    name: 'UserDashboard',
  })),
  useFocusEffect: jest.fn(),
}));

describe('HomeScreen (UserDashboard)', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    });
  });

  describe('Rendering', () => {
    it('should render HomeScreen without crashing', () => {
      const { getByText } = render(<UserDashboard />);
      
      // Check if welcome message is rendered
      expect(getByText(/Welcome back/i)).toBeTruthy();
    });

    it('should render all main sections', () => {
      const { getByText } = render(<UserDashboard />);
      
      // Check main sections
      expect(getByText(/Mood Check-in/i)).toBeTruthy();
      expect(getByText(/Services/i)).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should navigate when Mood Check-in button is pressed', () => {
      const { getByText } = render(<UserDashboard />);
      
      const moodCheckInButton = getByText('Mood Check-in');
      fireEvent.press(moodCheckInButton);
      
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should navigate when service button is pressed', () => {
      const { getByText } = render(<UserDashboard />);
      
      // Try to find and press a service button
      const appointmentsService = getByText('Appointments');
      fireEvent.press(appointmentsService);
      
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Content Display', () => {
    it('should display welcome message correctly', () => {
      const { getByText } = render(<UserDashboard />);
      
      expect(getByText(/Welcome back/i)).toBeTruthy();
    });
  });
});
