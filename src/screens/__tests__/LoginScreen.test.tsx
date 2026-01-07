/**
 * LoginScreen Test Suite
 * Tests for LoginScreen component
 * 
 * Requirements:
 * - At least 3 test cases: render, button press, không crash
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { useNavigation } from '@react-navigation/native';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

describe('LoginScreen', () => {
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
    it('should render LoginScreen without crashing', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText('BKMindCare')).toBeTruthy();
    });

    it('should render all main elements', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText('BKMindCare')).toBeTruthy();
      expect(getByText(/Ready\? Log in using account on:/i)).toBeTruthy();
      expect(getByText('HCMUT account')).toBeTruthy();
      expect(getByText('Psychologist')).toBeTruthy();
    });

    it('should render help text', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText(/Nếu bạn cần hỗ trợ/i)).toBeTruthy();
    });
  });

  describe('Button Interactions', () => {
    it('should navigate to UserDashboard when HCMUT account button is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      
      const hcmutButton = getByText('HCMUT account');
      fireEvent.press(hcmutButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('UserDashboard');
    });

    it('should navigate to DoctorDashboard when Psychologist button is pressed', () => {
      const { getByText } = render(<LoginScreen />);
      
      const adminButton = getByText('Psychologist');
      fireEvent.press(adminButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('DoctorDashboard');
    });
  });

  describe('Content Display', () => {
    it('should display correct title and instructions', () => {
      const { getByText } = render(<LoginScreen />);
      
      expect(getByText('BKMindCare')).toBeTruthy();
      expect(getByText(/Ready\? Log in using account on:/i)).toBeTruthy();
    });
  });
});

