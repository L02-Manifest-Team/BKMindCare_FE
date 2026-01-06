import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: 'appointment' | 'message';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  appointmentId?: number;
  chatId?: number;
}

const NOTIFICATIONS_KEY = '@notifications';
const UNREAD_COUNT_KEY = '@unread_notifications_count';

export const notificationService = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Save notifications
  saveNotifications: async (notifications: Notification[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  },

  // Add a new notification
  addNotification: async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> => {
    try {
      const notifications = await notificationService.getNotifications();
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false,
      };
      
      // Add to beginning of array (newest first)
      notifications.unshift(newNotification);
      
      // Keep only last 100 notifications
      const limitedNotifications = notifications.slice(0, 100);
      
      await notificationService.saveNotifications(limitedNotifications);
      await notificationService.updateUnreadCount();
      
      return newNotification;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const notifications = await notificationService.getNotifications();
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await notificationService.saveNotifications(updatedNotifications);
      await notificationService.updateUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    try {
      const notifications = await notificationService.getNotifications();
      const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
      await notificationService.saveNotifications(updatedNotifications);
      await notificationService.updateUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    try {
      const notifications = await notificationService.getNotifications();
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Update unread count in storage
  updateUnreadCount: async (): Promise<void> => {
    try {
      const count = await notificationService.getUnreadCount();
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, count.toString());
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      const notifications = await notificationService.getNotifications();
      const updatedNotifications = notifications.filter((n) => n.id !== notificationId);
      await notificationService.saveNotifications(updatedNotifications);
      await notificationService.updateUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },

  // Clear all notifications
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
      await AsyncStorage.removeItem(UNREAD_COUNT_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  },

  // Send push notification (only if expo-notifications is available)
  sendPushNotification: async (title: string, body: string, data?: any): Promise<void> => {
    try {
      // Dynamically import expo-notifications only when needed
      const Notifications = require('expo-notifications');
      
      if (!Notifications || !Notifications.requestPermissionsAsync || !Notifications.scheduleNotificationAsync) {
        return;
      }

      // Configure notification handler if not already configured
      if (Notifications.setNotificationHandler) {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }

      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      // expo-notifications not available (e.g., in Expo Go)
      // Silently fail - in-app notification is still created
    }
  },

  // Request notification permissions
  requestPermissions: async (): Promise<boolean> => {
    try {
      const Notifications = require('expo-notifications');
      if (!Notifications || !Notifications.requestPermissionsAsync) {
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  },
};

