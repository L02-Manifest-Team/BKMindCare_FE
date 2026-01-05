import React, { useState, useCallback, useEffect } from 'react';
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
import { Colors } from '../constants/colors';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { chatService, Chat } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { notificationService } from '../services/notificationService';

interface ChatConversation {
  id: number;
  targetId: number;
  targetName: string;
  targetAvatar?: string;
  targetRole: 'DOCTOR' | 'PATIENT';
  targetSpecialization?: string; // For doctors
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

const ChatListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastCheckedMessages, setLastCheckedMessages] = useState<Record<number, number>>({});

  const isDoctor = user?.role === 'DOCTOR';

  const navItems = isDoctor 
    ? [
        { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
        { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
        { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
        { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
      ]
    : [
        { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
        { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
        { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
        { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
      ];

  // Debug: Track component mount and user changes
  useEffect(() => {
    console.log('[ChatList] Component mounted/updated - user:', user?.id, user?.role, 'authLoading:', authLoading);
  }, [user, authLoading]);

  const loadConversations = useCallback(async () => {
    console.log('[ChatList] loadConversations called - user.id:', user?.id, 'user.role:', user?.role);
    try {
      // Don't show loading spinner for better UX - list will appear instantly
      // setLoading(true);
      
      // Wait for auth to complete before checking user
      if (!user || !user.id) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      const chats = await chatService.getChats();
      
      // Transform backend chats to UI format
      const transformedConversations: ChatConversation[] = chats.map((chat: Chat) => {
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        
        // Find the "other" participant
        const otherParticipant = chat.participants.find((p) => {
          const pId = typeof p.id === 'string' ? parseInt(p.id, 10) : p.id;
          return pId !== userId;
        }) || chat.participants[0];
        
        if (!otherParticipant) {
          return null;
        }

        // Determine display info based on roles
        let targetName = otherParticipant.full_name;
        let targetAvatar = otherParticipant.avatar || undefined;
        let targetSpecialization = undefined;

        if (isDoctor) {
          // Doctor viewing Patient
          targetName = otherParticipant.full_name || 'Sinh viên';
          // Keep real avatar for now, or hide if anonymous requirement prevents it (but user asked for separation, assumed real data logic from DoctorChatListScreen)
        } else {
          // Patient viewing Doctor
          targetSpecialization = otherParticipant.role === 'DOCTOR' ? 'Chuyên gia' : undefined;
        }
        
        return {
          id: chat.id,
          targetId: otherParticipant.id,
          targetName: targetName,
          targetAvatar: targetAvatar,
          targetRole: otherParticipant.role,
          targetSpecialization: targetSpecialization,
          lastMessage: chat.last_message?.content || 'Chưa có tin nhắn',
          lastMessageTime: chat.last_message 
            ? new Date(chat.last_message.created_at) 
            : new Date(0),
          unreadCount: chat.unread_count,
        };
      }).filter(Boolean) as ChatConversation[];

      transformedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      setConversations(transformedConversations);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.role]);

  useFocusEffect(
    useCallback(() => {
      console.log('[ChatList] useFocusEffect triggered - user:', user?.id, 'has user:', !!user);
      // Only load if user is available
      if (user && user.id) {
        loadConversations();
      } else {
        console.log('[ChatList] Skipping load - no user');
      }
    }, [loadConversations, user?.id])
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
    (conv.targetName && conv.targetName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (conv.targetSpecialization && conv.targetSpecialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenChat = (conversation: ChatConversation) => {
    // Navigate to shared Chat screen
    // Route name depends on role stack, but we will unify logic.
    // For now, let's assume we map 'Chat' and 'DoctorChat' to the same screen eventually.
    // But currently in App.tsx they are separate. We will update App.tsx to use SHARED components but keep route names if needed, 
    // OR ideally we point both to the SAME route name if possible, but TabBars rely on specific route names.
    // Let's rely on the route names that exist in the stacks, or new consolidated names.
    // The user asked to "unify the file", not necessarily the route names, but simplifying is better.
    // I will use 'Chat' for Patient and 'DoctorChat' for Doctor to respect existing navigation structure if I don't change stacks deeply.
    // However, I planned to "Update navigation".
    
    // Let's try to use a smart navigation.
    const routeName = isDoctor ? 'DoctorChat' : 'Chat';
    
    (navigation as any).navigate(routeName, {
      chatId: conversation.id,
      // Pass generic params that the new ChatScreen will understand
      targetId: conversation.targetId,
      targetName: conversation.targetName,
      targetAvatar: conversation.targetAvatar,
      targetRole: conversation.targetRole,
    });
  };

  const handleStartNewChat = () => {
    navigation.navigate('AllDoctors' as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        {!isDoctor && (
          <TouchableOpacity onPress={handleStartNewChat} style={styles.newChatButton}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
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
                  {conversation.targetAvatar ? (
                    <Image
                      source={{ uri: conversation.targetAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={24} color={isDoctor ? Colors.textSecondary : Colors.primary} />
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
                      {conversation.targetName}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {conversation.lastMessage}
                    </Text>
                    {conversation.targetSpecialization && (
                      <View style={styles.specializationTag}>
                        <Text style={styles.specializationTagText}>
                          {conversation.targetSpecialization}
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
              {isDoctor 
                ? 'Các cuộc trò chuyện với sinh viên sẽ hiển thị ở đây'
                : 'Bắt đầu trò chuyện với chuyên gia ngay'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar items={navItems} activeColor={isDoctor ? Colors.success : undefined} />
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
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
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
