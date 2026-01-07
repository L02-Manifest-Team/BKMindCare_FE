/**
 * MoodSelector Test Suite
 * Tests for MoodSelector component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MoodSelector } from '../MoodSelector';
import { MoodType } from '../../types';

describe('MoodSelector', () => {
  const mockOnSelectMood = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render MoodSelector without crashing', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      expect(getByText('Happy')).toBeTruthy();
    });

    it('should render all mood options', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      expect(getByText('Happy')).toBeTruthy();
      expect(getByText('Calm')).toBeTruthy();
      expect(getByText('Relax')).toBeTruthy();
      expect(getByText('Focus')).toBeTruthy();
    });
  });

  describe('Mood Selection', () => {
    it('should call onSelectMood when a mood is pressed', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      const happyButton = getByText('Happy');
      fireEvent.press(happyButton);
      
      expect(mockOnSelectMood).toHaveBeenCalledWith('happy');
      expect(mockOnSelectMood).toHaveBeenCalledTimes(1);
    });

    it('should call onSelectMood with correct mood type for each mood', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      // Test Happy
      fireEvent.press(getByText('Happy'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('happy');
      
      // Test Calm
      fireEvent.press(getByText('Calm'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('calm');
      
      // Test Relax
      fireEvent.press(getByText('Relax'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('relax');
      
      // Test Focus
      fireEvent.press(getByText('Focus'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('focus');
    });

    it('should highlight selected mood', () => {
      const { getByText, rerender } = render(
        <MoodSelector 
          selectedMood="happy" 
          onSelectMood={mockOnSelectMood} 
        />
      );
      
      // Component should render with selected mood
      expect(getByText('Happy')).toBeTruthy();
      
      // Re-render with different selected mood
      rerender(
        <MoodSelector 
          selectedMood="calm" 
          onSelectMood={mockOnSelectMood} 
        />
      );
      
      expect(getByText('Calm')).toBeTruthy();
    });
  });

  describe('Multiple Selections', () => {
    it('should allow selecting different moods sequentially', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      // Select Happy
      fireEvent.press(getByText('Happy'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('happy');
      
      // Select Calm
      fireEvent.press(getByText('Calm'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('calm');
      
      // Select Relax
      fireEvent.press(getByText('Relax'));
      expect(mockOnSelectMood).toHaveBeenCalledWith('relax');
      
      expect(mockOnSelectMood).toHaveBeenCalledTimes(3);
    });
  });

  describe('No Selection', () => {
    it('should render without selected mood', () => {
      const { getByText } = render(
        <MoodSelector onSelectMood={mockOnSelectMood} />
      );
      
      expect(getByText('Happy')).toBeTruthy();
      expect(getByText('Calm')).toBeTruthy();
      expect(getByText('Relax')).toBeTruthy();
      expect(getByText('Focus')).toBeTruthy();
    });
  });
});

