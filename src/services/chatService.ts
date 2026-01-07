import { api } from './api';

// Types matching backend schemas
export interface ChatParticipant {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
  avatar: string | null;
  role: 'PATIENT' | 'DOCTOR';
}

export interface Message {
  id: number;
  sender_id: number;
  chat_id: number;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Chat {
  id: number;
  participants: ChatParticipant[];
  last_message: Message | null;
  unread_count: number;
}

export interface ChatListResponse {
  data: Chat[];
}

export interface MessageCreate {
  content: string;
}

// Backend response formats (mixed snake_case and camelCase)
interface BackendMessageResponse {
  id: number | string;
  content: string;
  senderId?: number | string;
  sender_id?: number;
  chatId?: number | string;
  chat_id?: number;
  createdAt?: string;
  created_at?: string;
  read: boolean;
}

// Helper function to normalize message response
const normalizeMessage = (msg: BackendMessageResponse): Message => {
  // Parse created_at correctly - assume UTC if no timezone info
  let created_at_str = msg.created_at || msg.createdAt || new Date().toISOString();
  
  // If string doesn't end with Z or timezone, assume it's UTC
  if (typeof created_at_str === 'string' && !created_at_str.endsWith('Z') && !created_at_str.includes('+') && !created_at_str.includes('-', 10)) {
    created_at_str = created_at_str + 'Z';
  }
  
  return {
    id: typeof msg.id === 'string' ? parseInt(msg.id, 10) : msg.id,
    sender_id: msg.sender_id || (msg.senderId ? (typeof msg.senderId === 'string' ? parseInt(msg.senderId, 10) : msg.senderId) : 0),
    chat_id: msg.chat_id || (msg.chatId ? (typeof msg.chatId === 'string' ? parseInt(msg.chatId, 10) : msg.chatId) : 0),
    content: msg.content,
    created_at: created_at_str,
    read: msg.read,
  };
};

export interface CreateChatRequest {
  doctor_id: number;
}

export const chatService = {
  // Create a new chat with a doctor
  createChat: async (doctorId: number): Promise<Chat> => {
    try {
      const response = await api.post<Chat>('/chats/', {
        doctor_id: doctorId,
      });
      return response;
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  },

  // Get all chats for the current user
  getChats: async (): Promise<Chat[]> => {
    try {
      const response = await api.get<ChatListResponse>('/chats/');
      const chats = response.data || [];
      
      // Normalize last_message if exists
      return chats.map(chat => ({
        ...chat,
        last_message: chat.last_message ? normalizeMessage(chat.last_message as any) : null,
      }));
    } catch (error) {
      console.error('Get chats error:', error);
      throw error;
    }
  },

  // Get messages from a specific chat
  getMessages: async (
    chatId: number,
    skip: number = 0,
    limit: number = 100
  ): Promise<Message[]> => {
    try {
      const response = await api.get<BackendMessageResponse[]>(
        `/chats/${chatId}/messages?skip=${skip}&limit=${limit}`
      );
      // Normalize messages to consistent format
      return (response || []).map(normalizeMessage);
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Send a message in a chat
  sendMessage: async (
    chatId: number,
    content: string
  ): Promise<Message> => {
    try {
      const response = await api.post<BackendMessageResponse>(
        `/chats/${chatId}/messages`,
        { content }
      );
      return normalizeMessage(response);
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Edit a message
  editMessage: async (
    chatId: number,
    messageId: number,
    content: string
  ): Promise<Message> => {
    try {
      const response = await api.put<BackendMessageResponse>(
        `/chats/${chatId}/messages/${messageId}`,
        { content }
      );
      return normalizeMessage(response);
    } catch (error) {
      console.error('Edit message error:', error);
      throw error;
    }
  },

  // Delete a message
  deleteMessage: async (
    chatId: number,
    messageId: number
  ): Promise<void> => {
    try {
      await api.delete(`/chats/${chatId}/messages/${messageId}`);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },
};

