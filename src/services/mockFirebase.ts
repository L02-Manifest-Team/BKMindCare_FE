// Mock Firebase services for UI testing without backend
import { MoodType, Appointment, ChatMessage } from '../types';

// Mock Firestore-like API
class MockFirestore {
  private collections: Map<string, any[]> = new Map();

  collection(name: string) {
    const self = this;
    return {
      add: async (data: any) => {
        if (!self.collections.has(name)) {
          self.collections.set(name, []);
        }
        const doc = { id: Date.now().toString(), ...data };
        self.collections.get(name)!.push(doc);
        return { id: doc.id };
      },
      get: async () => {
        const docs = self.collections.get(name) || [];
        return {
          docs: docs.map((doc) => ({
            id: doc.id,
            data: () => {
              const { id, ...data } = doc;
              return data;
            },
          })),
        };
      },
    };
  }

  query(collectionName: string, ...filters: any[]) {
    const self = this;
    return {
      onSnapshot: (callback: (snapshot: any) => void) => {
        const docs = self.collections.get(collectionName) || [];
        const snapshot = {
          docs: docs.map((doc) => ({
            id: doc.id,
            data: () => {
              const { id, ...data } = doc;
              return data;
            },
          })),
        };
        callback(snapshot);
        // Return unsubscribe function
        return () => {};
      },
    };
  }
}

const mockDb = new MockFirestore();

// Mock Auth
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    return { user: { uid: 'user1', email } };
  },
  signOut: async () => {
    // Mock sign out
  },
};

// Mock Firestore
export const db = {
  collection: (path: string) => {
    const parts = path.split('/');
    if (parts.length === 1) {
      return mockDb.collection(parts[0]);
    } else if (parts.length === 3) {
      // For subcollections like 'chats/{chatId}/messages'
      const collectionName = `${parts[0]}/${parts[1]}/${parts[2]}`;
      return mockDb.collection(collectionName);
    }
    return mockDb.collection(path);
  },
};

// Mock Storage
export const storage = {
  ref: (path: string) => ({
    put: async (file: any) => {
      return { ref: { fullPath: path } };
    },
    getDownloadURL: async () => {
      return `https://mock-storage.com/${path}`;
    },
  }),
};

// Helper to add mock data
export const addMockData = () => {
  // Add some mock mood check-ins
  mockDb.collection('moodCheckIns').add({
    userId: 'user1',
    mood: 'happy' as MoodType,
    date: new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
  });

  // Add some mock appointments
  mockDb.collection('appointments').add({
    doctorId: '1',
    doctorName: 'Mrs. Hanh',
    patientId: 'user1',
    patientName: 'Candy',
    date: '11/10/2023',
    time: '06:00 PM',
    type: 'in-person',
    location: 'BK.D6',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  });

  // Add some mock chat messages
  mockDb.collection('chats/anonymous-chat-1/messages').add({
    text: 'Xin chào, tôi có thể giúp gì cho bạn?',
    createdAt: new Date(),
    user: {
      _id: 'doctor1',
      name: 'Dr. Minh',
    },
  });
};

export default { auth, db, storage };

