import { api } from './api';

export interface JournalEntry {
  id: number;
  user_id: number;
  content: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalListResponse {
  data: JournalEntry[];
  total: number;
}

export interface CreateJournalData {
  content: string;
  title?: string | null;
}

export interface UpdateJournalData {
  content?: string;
  title?: string | null;
}

export const journalService = {
  // Create a new journal entry
  createEntry: async (data: CreateJournalData): Promise<JournalEntry> => {
    try {
      const response = await api.post<JournalEntry>('/journal/', data);
      return response;
    } catch (error) {
      console.error('Create journal error:', error);
      throw error;
    }
  },

  // Get all journal entries
  getEntries: async (skip: number = 0, limit: number = 50): Promise<JournalListResponse> => {
    try {
      const response = await api.get<JournalListResponse>(`/journal/?skip=${skip}&limit=${limit}`);
      return response;
    } catch (error: any) {
      console.error('Get journal entries error:', error);
      throw error;
    }
  },

  // Get a specific journal entry
  getEntry: async (journalId: number): Promise<JournalEntry> => {
    try {
      const response = await api.get<JournalEntry>(`/journal/${journalId}`);
      return response;
    } catch (error) {
      console.error('Get journal entry error:', error);
      throw error;
    }
  },

  // Update a journal entry
  updateEntry: async (journalId: number, data: UpdateJournalData): Promise<JournalEntry> => {
    try {
      const response = await api.put<JournalEntry>(`/journal/${journalId}`, data);
      return response;
    } catch (error) {
      console.error('Update journal error:', error);
      throw error;
    }
  },

  // Delete a journal entry
  deleteEntry: async (journalId: number): Promise<void> => {
    try {
      await api.delete(`/journal/${journalId}`);
    } catch (error) {
      console.error('Delete journal error:', error);
      throw error;
    }
  },
};
