import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';
// Using mock Firebase for UI testing
import { db } from '../../config/firebase';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState<IMessage[]>([]);
  
  const routeParams = route.params as any;
  const chatId = routeParams?.chatId || 'anonymous-chat-1';
  const doctorId = routeParams?.doctorId;
  const isAnonymous = routeParams?.isAnonymous !== undefined ? routeParams.isAnonymous : !doctorId;
  const doctorName = routeParams?.doctorName;
  const doctorAvatar = routeParams?.doctorAvatar;

  // In anonymous chat, student can see doctor info, but doctor can't see student info
  const currentUser: User = {
    _id: isAnonymous ? 'anonymous' : 'user1',
    name: isAnonymous ? 'Anonymous' : 'Candy',
    avatar: isAnonymous ? undefined : 'https://i.pravatar.cc/150?img=5',
  };

  useEffect(() => {
    // Mock: Load messages from mock Firebase
    const loadMessages = async () => {
      try {
        const messagesRef = db.collection(`chats/${chatId}/messages`);
        const snapshot = await messagesRef.get();
        const newMessages = snapshot.docs.map((doc: any) => {
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
            _id: doc.id,
            text: data.text,
            createdAt: createdAt,
            user: {
              _id: data.user._id,
              name: data.user.name,
              avatar: data.user.avatar,
            },
          };
        });
        // Sort by createdAt descending (newest first for GiftedChat)
        newMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setMessages(newMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
    // Simulate real-time updates every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (newMessages.length === 0) return;

    const message = newMessages[0];
    try {
      await db.collection(`chats/${chatId}/messages`).add({
        text: message.text,
        createdAt: new Date(),
        user: {
          _id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
      });
      // Update local state immediately for better UX
      setMessages((prevMessages) => [...newMessages, ...prevMessages]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [chatId, currentUser]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.userInfo}>
            {/* Always show doctor info to student, even in anonymous chat */}
            {doctorAvatar ? (
              <Image
                source={{ uri: doctorAvatar }}
                style={styles.doctorAvatarImage}
              />
            ) : (
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
            )}
            <View>
              <Text style={styles.userName}>
                {doctorName || 'Dr. Support'}
              </Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
                {isAnonymous && (
                  <View style={styles.anonymousBadgeHeader}>
                    <Ionicons name="lock-closed" size={12} color={Colors.primary} />
                    <Text style={styles.anonymousBadgeText}>Ẩn danh</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={currentUser}
          placeholder="Nhập tin nhắn..."
          renderBubble={(props) => (
            <View
              style={[
                styles.bubble,
                props.currentMessage?.user._id === currentUser._id
                  ? styles.sentBubble
                  : styles.receivedBubble,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  props.currentMessage?.user._id === currentUser._id
                    ? styles.sentBubbleText
                    : styles.receivedBubbleText,
                ]}
              >
                {props.currentMessage?.text}
              </Text>
            </View>
          )}
          renderInputToolbar={(props) => {
            return (
              <View style={styles.inputToolbar}>
                <TouchableOpacity style={styles.inputButton}>
                  <Ionicons name="add-circle" size={24} color={Colors.primary} />
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                  {props.textInput}
                </View>
                <TouchableOpacity style={styles.inputButton}>
                  <Ionicons name="mic" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            );
          }}
          renderAvatar={(props) => {
            if (props.currentMessage?.user._id === currentUser._id) {
              return null;
            }
            return (
              <View style={styles.avatar}>
                <Ionicons name="person" size={16} color={Colors.primary} />
              </View>
            );
          }}
          showUserAvatar={false}
          alwaysShowSend
          scrollToBottom
          infiniteScroll
        />
      </KeyboardAvoidingView>

      {/* Anonymous Badge */}
      {isAnonymous && (
        <View style={styles.anonymousBadge}>
          <Ionicons name="lock-closed" size={14} color={Colors.primary} />
          <Text style={styles.anonymousText}>Chat ẩn danh - Thông tin của bạn được bảo mật</Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigationBar
        items={[
          { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
          { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
          { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
          { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
        ]}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  doctorAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  anonymousBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  anonymousBadgeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.purpleLight,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    marginBottom: 4,
  },
  sentBubble: {
    backgroundColor: Colors.secondary,
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  receivedBubble: {
    backgroundColor: Colors.backgroundLight,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  bubbleText: {
    fontSize: 16,
  },
  sentBubbleText: {
    color: Colors.background,
  },
  receivedBubbleText: {
    color: Colors.text,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  anonymousText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputButton: {
    padding: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
});

export default ChatScreen;

