import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { db } from '../../config/firebase';
import BottomNavigationBar from '../../components/BottomNavigationBar';

interface ChatConversation {
  id: string;
  patientName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isAnonymous: boolean;
}

const DoctorChatListScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
  ];

  useEffect(() => {
    // Load conversations from mock data
    const loadConversations = async () => {
      try {
        const chatIds = ['anonymous-chat-1', 'chat-doctor-1', 'chat-doctor-2'];
        const loadedConversations: ChatConversation[] = [];

        for (const chatId of chatIds) {
          try {
            const messagesRef = db.collection(`chats/${chatId}/messages`);
            const snapshot = await messagesRef.get();
            
            if (snapshot.docs.length > 0) {
              const allMessages = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                let createdAt: Date;
                if (data.createdAt instanceof Date) {
                  createdAt = data.createdAt;
                } else if (data.createdAt?.toDate) {
                  createdAt = data.createdAt.toDate();
                } else if (data.createdAt) {
                  createdAt = new Date(data.createdAt);
                } else {
                  createdAt = new Date();
                }
                return {
                  text: data.text,
                  createdAt: createdAt,
                  user: data.user,
                };
              });

              allMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
              const lastMessage = allMessages[0];
              const isAnonymous = chatId.includes('anonymous');
              const isDoctorMessage = lastMessage.user?._id?.toString().startsWith('doctor');
              const patientDisplayName = isAnonymous
                ? 'Sinh viên ẩn danh'
                : (isDoctorMessage ? 'Sinh viên' : lastMessage.user?.name || 'Sinh viên');

              loadedConversations.push({
                id: chatId,
                patientName: patientDisplayName,
                lastMessage: lastMessage.text,
                lastMessageTime: lastMessage.createdAt,
                unreadCount: 0,
                isAnonymous,
              });
            }
          } catch (error) {
            console.error(`Error loading chat ${chatId}:`, error);
          }
        }

        loadedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
        setConversations(loadedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, []);

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
    conv.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartAnonymousChat = () => {
    navigation.navigate('DoctorChat' as never, {
      chatId: 'anonymous-chat-1',
      doctorId: '1',
      doctorName: 'Hoang Le Hai Thanh',
      doctorAvatar: undefined,
      isAnonymous: true,
    } as any);
  };

  const handleOpenChat = (conversation: ChatConversation) => {
    navigation.navigate('DoctorChat' as never, {
      chatId: conversation.id,
      doctorId: '1',
      doctorName: 'Hoang Le Hai Thanh',
      doctorAvatar: undefined,
      isAnonymous: conversation.isAnonymous,
    } as any);
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

      {/* Anonymous Chat Button */}
      <View style={styles.anonymousSection}>
        <TouchableOpacity
          style={styles.anonymousButton}
          onPress={handleStartAnonymousChat}
          activeOpacity={0.7}
        >
          <View style={styles.anonymousIconContainer}>
            <Ionicons name="lock-closed" size={24} color={Colors.primary} />
          </View>
          <View style={styles.anonymousInfo}>
            <Text style={styles.anonymousTitle}>Chat ẩn danh</Text>
            <Text style={styles.anonymousSubtitle}>
              Trò chuyện với sinh viên ẩn danh - Thông tin của bạn được hiển thị công khai
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredConversations.length > 0 ? (
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
                  {conversation.isAnonymous ? (
                    <View style={styles.anonymousAvatar}>
                      <Ionicons name="lock-closed" size={20} color={Colors.textSecondary} />
                    </View>
                  ) : (
                    <View style={styles.patientAvatar}>
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
                      {conversation.patientName}
                    </Text>
                    <Text style={styles.conversationTime}>
                      {formatTime(conversation.lastMessageTime)}
                    </Text>
                  </View>
                  <View style={styles.conversationFooter}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {conversation.lastMessage}
                    </Text>
                    {conversation.isAnonymous && (
                      <View style={styles.anonymousTag}>
                        <Ionicons name="lock-closed" size={10} color={Colors.primary} />
                        <Text style={styles.anonymousTagText}>Ẩn danh</Text>
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
              Bấm vào nút "Chat ẩn danh" để bắt đầu
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar items={navItems} activeColor={Colors.success} />
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
    borderWidth: 2,
    borderColor: Colors.primary,
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
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  anonymousAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
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
  anonymousTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  anonymousTagText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
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

export default DoctorChatListScreen;

