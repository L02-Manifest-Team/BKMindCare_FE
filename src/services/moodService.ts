import { api } from './api';

// Mood types matching backend enum
export type MoodType = 'HAPPY' | 'SAD' | 'ANXIOUS' | 'STRESSED' | 'CALM' | 'ANGRY' | 'TIRED' | 'EXCITED';

export interface MoodEntry {
  id: number;
  user_id: number;
  mood: MoodType;
  notes: string | null;
  created_at: string;
}

export interface MoodHistoryResponse {
  data: MoodEntry[];
}

export interface CreateMoodData {
  mood: MoodType;
  notes?: string | null;
}

export const moodService = {
  // Create a new mood entry
  createMoodEntry: async (data: CreateMoodData): Promise<MoodEntry> => {
    try {
      const response = await api.post<MoodEntry>('/mood/', data);
      return response;
    } catch (error) {
      console.error('Create mood error:', error);
      throw error;
    }
  },

  // Get mood history
  getMoodHistory: async (
    startDate?: string, 
    endDate?: string, 
    limit: number = 30
  ): Promise<MoodEntry[]> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      params.append('limit', limit.toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/mood/history?${queryString}` : '/mood/history';
      
      const response = await api.get<MoodHistoryResponse>(endpoint);
      return response.data || [];
    } catch (error: any) {
      console.error('Get mood history error:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  },

  // Get latest mood entry
  getLatestMood: async (): Promise<MoodEntry | null> => {
    try {
      const response = await api.get<MoodEntry | null>('/mood/latest');
      return response;
    } catch (error) {
      console.error('Get latest mood error:', error);
      // Return null instead of throwing - doctors don't have mood data
      return null;
    }
  },

  // Check if user has already checked in today (based on local timezone, reset at 0h)
  hasTodayCheckIn: async (): Promise<boolean> => {
    try {
      const latestMood = await moodService.getLatestMood();
      
      if (!latestMood) {
        return false;
      }
      
      // Get today's date in local timezone (reset at 0h)
      const now = new Date();
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Parse mood created_at - use same logic as getStreakData
      let dateStr = latestMood.created_at;
      if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        dateStr = dateStr + 'Z';
      }
      const moodDateUTC = new Date(dateStr);
      
      // Convert to local date (ignoring time)
      const moodDateLocal = new Date(
        moodDateUTC.getFullYear(),
        moodDateUTC.getMonth(),
        moodDateUTC.getDate()
      );
      
      // Compare dates (ignoring time)
      return todayLocal.getTime() === moodDateLocal.getTime();
    } catch (error) {
      console.error('Check today check-in error:', error);
      return false; // If error, assume not checked in
    }
  },

  // Get today's mood entry (if exists)
  getTodayMood: async (): Promise<MoodEntry | null> => {
    try {
      const hasCheckedIn = await moodService.hasTodayCheckIn();
      if (hasCheckedIn) {
        return await moodService.getLatestMood();
      }
      return null;
    } catch (error) {
      console.error('Get today mood error:', error);
      return null;
    }
  },

  // Get streak data (consecutive days and weekly check-in status with mood)
  getStreakData: async (): Promise<{
    streakCount: number;
    weeklyStatus: { day: string; checked: boolean; mood?: MoodType }[];
    userName: string;
  }> => {
    try {
      // Get more history to ensure we have all dates
      const history = await moodService.getMoodHistory(undefined, undefined, 365);
      const now = new Date();
      
      // Helper to get local date string (YYYY-MM-DD) from a date
      const getLocalDateStr = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Helper to parse created_at and get local date string
      const getLocalDateFromEntry = (entry: MoodEntry): string => {
        try {
          // Parse created_at - assume UTC if no timezone info
          let dateStr = entry.created_at;
          if (typeof dateStr === 'string') {
            // If string doesn't have timezone, assume UTC
            if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
              dateStr = dateStr + 'Z';
            }
            const utcDate = new Date(dateStr);
            // Convert to local date string
            return getLocalDateStr(utcDate);
          }
          // If already a Date object or other format
          const date = new Date(dateStr);
          return getLocalDateStr(date);
        } catch (error) {
          console.error('Error parsing date from entry:', entry.created_at, error);
          // Fallback: use current date
          return getLocalDateStr(new Date());
        }
      };
      
      // Group entries by date and keep the latest mood for each date
      const checkedDatesMap = new Map<string, { mood: MoodType; entry: MoodEntry }>();
      
      // Sort by created_at descending (newest first) to process latest entries first
      const sortedHistory = [...history].sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return timeB - timeA; // Descending
      });
      
      sortedHistory.forEach(entry => {
        const localDateStr = getLocalDateFromEntry(entry);
        
        // Only add if we don't have an entry for this date yet
        // Since we sorted descending, the first entry for each date is the latest
        if (!checkedDatesMap.has(localDateStr)) {
          checkedDatesMap.set(localDateStr, { mood: entry.mood, entry });
        }
      });
      
      // Debug logging (can be removed in production)
      if (__DEV__) {
        console.log('Total history entries:', history.length);
        console.log('Checked dates map:', Array.from(checkedDatesMap.keys()));
        console.log('Checked dates count:', checkedDatesMap.size);
      }
      
      // Count streak (consecutive days from today backwards)
      let streakCount = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        checkDate.setHours(0, 0, 0, 0); // Reset to start of day
        const dateStr = getLocalDateStr(checkDate);
        
        if (checkedDatesMap.has(dateStr)) {
          streakCount++;
        } else {
          // If today (i=0) has no check-in, don't break, just continue
          // Only break if a past day is missing
          if (i > 0) {
            break;
          }
        }
      }
      
      // Weekly status with mood (last 5 days, oldest to newest)
      const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const weeklyStatus: { day: string; checked: boolean; mood?: MoodType }[] = [];
      
      for (let i = 4; i >= 0; i--) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() - i);
        checkDate.setHours(0, 0, 0, 0); // Reset to start of day
        const dateStr = getLocalDateStr(checkDate);
        const dayOfWeek = checkDate.getDay();
        const dateInfo = checkedDatesMap.get(dateStr);
        
        weeklyStatus.push({
          day: weekDays[dayOfWeek],
          checked: dateInfo !== undefined,
          mood: dateInfo?.mood,
        });
      }
      
      return { streakCount, weeklyStatus, userName: 'Bạn' };
    } catch (error) {
      console.error('Get streak data error:', error);
      return { streakCount: 0, weeklyStatus: [], userName: 'Bạn' };
    }
  },
};
