import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { chatService, Chat } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notificationService';

interface ChatConversation {
  id: number;
  doctorId: number;
  doctorName: string;
  doctorSpecialization?: string;
  doctorAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

const ChatListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheckedMessages, setLastCheckedMessages] = useState<Record<number, number>>({});

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
  ];

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user || !user.id) {
        console.warn('User not authenticated, skipping chat load', { user: user ? { id: user.id, email: user.email } : null });
        setConversations([]);
        return;
      }
      
      const chats = await chatService.getChats();
      
      // Transform backend chats to UI format
      const transformedConversations: ChatConversation[] = chats.map((chat: Chat) => {
        // Find doctor participant (exclude current user)
        // Convert user.id to number for comparison
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const doctorParticipant = chat.participants.find(
          (p) => p.role === 'DOCTOR' && p.id !== userId
        ) || chat.participants.find((p) => p.id !== userId) || chat.participants[0];
        
        return {
          id: chat.id,
          doctorId: doctorParticipant.id,
          doctorName: doctorParticipant.full_name,
          doctorSpecialization: doctorParticipant.role === 'DOCTOR' ? 'Chuyên gia' : undefined,
          doctorAvatar: doctorParticipant.avatar || undefined,
          lastMessage: chat.last_message?.content || 'Chưa có tin nhắn',
          // Use epoch date for chats with no messages so they sort to bottom
          lastMessageTime: chat.last_message 
            ? new Date(chat.last_message.created_at) 
            : new Date(0), // Unix epoch (1970-01-01) for empty chats
          unreadCount: chat.unread_count,
        };
      });

      transformedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      // Check for new messages and create notifications
      for (const chat of chats) {
        if (chat.last_message && chat.unread_count > 0) {
          const lastMessageId = chat.last_message.id;
          const lastCheckedId = lastCheckedMessages[chat.id] || 0;
          
          // If this is a new message (not checked before)
          if (lastMessageId > lastCheckedId) {
            // Find doctor participant
            const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
            const doctorParticipant = chat.participants.find(
              (p) => p.role === 'DOCTOR' && p.id !== userId
            ) || chat.participants.find((p) => p.id !== userId) || chat.participants[0];
            
            // Only create notification if message is from doctor (not from current user)
            const messageFromDoctor = chat.last_message.sender_id !== userId;
            if (messageFromDoctor) {
              const doctorName = doctorParticipant.full_name;
              const messagePreview = chat.last_message.content.length > 50 
                ? chat.last_message.content.substring(0, 50) + '...'
                : chat.last_message.content;
              
              // Create notification
              await addNotification({
                type: 'message',
                title: doctorName,
                message: messagePreview,
                chatId: chat.id,
              });

              // Send push notification
              await notificationService.sendPushNotification(
                `Tin nhắn mới từ ${doctorName}`,
                messagePreview,
                {
                  type: 'message',
                  chatId: chat.id,
                }
              );
            }
            
            // Update last checked message ID
            setLastCheckedMessages(prev => ({
              ...prev,
              [chat.id]: lastMessageId,
            }));
          }
        }
      }
      
      setConversations(transformedConversations);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      // Handle authentication errors
      if (error?.message?.includes('hết hạn')) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục sử dụng.',
          [
            {
              text: 'Đăng nhập lại',
              onPress: async () => {
                try {
                  await logout();
                  navigation.navigate('Login' as never);
                } catch (logoutError) {
                  console.error('Logout error:', logoutError);
                  navigation.navigate('Login' as never);
                }
              },
            },
          ]
        );
      } else if (error?.message && !error.message.includes('Not Found')) {
        Alert.alert('Lỗi', `Không thể tải danh sách chat. Vui lòng thử lại.\n${error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, navigation, logout]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadConversations();
  }, [loadConversations]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.doctorSpecialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartAnonymousChat = async () => {
    // Navigate to AllDoctorsScreen to select a doctor
    navigation.navigate('AllDoctors' as never);
  };

  const handleOpenChat = (conversation: ChatConversation) => {
    (navigation as any).navigate('Chat', {
      chatId: conversation.id,
      doctorId: conversation.doctorId,
      doctorName: conversation.doctorName,
      doctorAvatar: conversation.doctorAvatar,
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={handleStartAnonymousChat} style={styles.newChatButton}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm cuộc trò chuyện..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : filteredConversations.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Cuộc trò chuyện</Text>
            {filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={styles.conversationItem}
                onPress={() => handleOpenChat(conversation)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarContainer}>
                  {conversation.doctorAvatar ? (
                    <Image
                      source={{ uri: conversation.doctorAvatar }}
                      style={styles.doctorAvatarImage}
                    />
                  ) : (
                    <View style={styles.doctorAvatar}>
                      <Ionicons name="person" size={24} color={Colors.primary} />
                    </View>
                  )}
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName} numberOfLines={1}>
                      {conversation.doctorName}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {conversation.lastMessage}
                    </Text>
                    {conversation.doctorSpecialization && (
                      <View style={styles.specializationTag}>
                        <Text style={styles.specializationTagText}>
                          {conversation.doctorSpecialization}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>Chưa có cuộc trò chuyện nào</Text>
            <Text style={styles.emptyStateSubtext}>
              Các cuộc trò chuyện với chuyên gia sẽ hiển thị ở đây
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar items={navItems} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  newChatButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  anonymousSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  anonymousIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  anonymousInfo: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  anonymousSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  specializationTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  specializationTagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChatListScreen;

