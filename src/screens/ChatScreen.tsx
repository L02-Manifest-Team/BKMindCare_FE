import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  TextInput,
  Keyboard,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { chatService, Message } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { websocketService } from '../services/websocketService';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputText, setInputText] = useState('');
  
  const inputRef = useRef<TextInput>(null);
  const chatIdRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Route Params
  const routeParams = route.params as any;
  const chatId = routeParams?.chatId;
  
  // State for target info (initialized from params, but can be updated)
  const [targetName, setTargetName] = useState(routeParams?.targetName || 'Người dùng');
  const [targetAvatar, setTargetAvatar] = useState(routeParams?.targetAvatar);
  const [targetRole, setTargetRole] = useState(routeParams?.targetRole);

  const isDoctor = user?.role === 'DOCTOR';
  const currentUserId = user?.id ? String(user.id) : '0';

  // Fallback: If critical params are missing, fetch chat details
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!chatId || (routeParams?.targetName && routeParams?.targetRole)) return;
      
      try {
        console.log('[ChatScreen] Missing params, fetching chat details for ID:', chatId);
        const chats = await chatService.getChats();
        const chatIdNum = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
        const chat = chats.find(c => c.id === chatIdNum);
        
        if (chat) {
          const userId = typeof user?.id === 'string' ? parseInt(user.id, 10) : user?.id;
          const otherParticipant = chat.participants.find(p => p.id !== userId) || chat.participants[0];
          
          if (otherParticipant) {
            console.log('[ChatScreen] Found participant:', otherParticipant.full_name);
            setTargetName(otherParticipant.full_name || (isDoctor ? 'Sinh viên' : 'Chuyên gia'));
            setTargetAvatar(otherParticipant.avatar || undefined);
            setTargetRole(otherParticipant.role);
          }
        }
      } catch (error) {
        console.error('[ChatScreen] Error fetching chat details:', error);
      }
    };
    
    fetchChatDetails();
  }, [chatId, routeParams, user, isDoctor]);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Use a ref to track messages to prevent duplicates during rapid updates
  const messagesRef = useRef<IMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load initial messages from API
  const loadMessages = useCallback(async () => {
    if (!chatId || !user?.id) {
      setLoading(false);
      return;
    }

    const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
    
    try {
      // Don't show loading spinner for better UX - messages will appear instantly
      // if (!hasLoadedRef.current || chatIdRef.current !== chatIdNumber) {
      //   setLoading(true);
      // }
      
      chatIdRef.current = chatIdNumber;
      console.log('[ChatScreen] Loading messages for chat:', chatIdNumber);
      
      // Load recent messages
      const backendMessages = await chatService.getMessages(chatIdNumber, 0, 50);
      
      // Convert to GiftedChat format
      const giftedMessages: IMessage[] = backendMessages.map((msg: Message) => {
        let date: Date;
        if (typeof msg.created_at === 'string') {
          const dateStr = msg.created_at.endsWith('Z') || msg.created_at.includes('+') || msg.created_at.includes('-', 10)
            ? msg.created_at
            : msg.created_at + 'Z';
          date = new Date(dateStr);
        } else {
          date = new Date(msg.created_at);
        }
        
        const senderId = String(msg.sender_id);
        const isCurrentUser = currentUserId === senderId;
        
        let displayName: string;
        let displayAvatar: string | undefined;
        
        if (isCurrentUser) {
          displayName = user?.full_name || 'Bạn';
          displayAvatar = user?.avatar || undefined;
        } else {
          displayName = targetName;
          displayAvatar = targetAvatar;
        }
        
        return {
          _id: msg.id.toString(),
          text: msg.content,
          createdAt: date,
          user: {
            _id: senderId,
            name: displayName,
            avatar: displayAvatar,
          },
        };
      });
      
      setMessages(giftedMessages);
      hasLoadedRef.current = true;
    } catch (error: any) {
      console.error('[ChatScreen] Error loading messages:', error);
      Alert.alert('Lỗi', 'Không thể tải tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [chatId, user, targetName, targetAvatar, currentUserId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: Message) => {
    if (!user?.id || !chatIdRef.current) return;
    
    console.log('[ChatScreen] Received WebSocket message:', message.id);
    console.log('[ChatScreen] Current targetName:', targetName);
    console.log('[ChatScreen] Message sender_id:', message.sender_id);
    console.log('[ChatScreen] Current user id:', user.id);
    
    // Parse Date
    let date: Date;
    if (typeof message.created_at === 'string') {
      const dateStr = message.created_at.endsWith('Z') || message.created_at.includes('+') || message.created_at.includes('-', 10)
        ? message.created_at
        : message.created_at + 'Z';
      date = new Date(dateStr);
    } else {
      date = new Date(message.created_at);
    }
    
    const senderId = String(message.sender_id);
    const isCurrentUser = currentUserId === senderId;

    let displayName: string;
    let displayAvatar: string | undefined;
    
    if (isCurrentUser) {
      displayName = user?.full_name || 'Bạn';
      displayAvatar = user?.avatar || undefined;
    } else {
      displayName = targetName || (isDoctor ? 'Sinh viên' : 'Chuyên gia');
      displayAvatar = targetAvatar;
    }
    
    console.log('[ChatScreen] Display name for message:', displayName);
    
    const newMessage: IMessage = {
      _id: message.id.toString(),
      text: message.content,
      createdAt: date,
      user: {
        _id: senderId,
        name: displayName,
        avatar: displayAvatar,
      },
    };
    
    setMessages((previousMessages) => {
      const exists = previousMessages.some(msg => msg._id === newMessage._id);
      if (exists) {
        console.log('[ChatScreen] Message already exists, skipping');
        return previousMessages;
      }
      console.log('[ChatScreen] Adding new message to chat');
      return GiftedChat.append(previousMessages, [newMessage]);
    });
  }, [user, targetName, targetAvatar, currentUserId, isDoctor]);

  // Connect WebSocket & Load Messages
  useFocusEffect(
    useCallback(() => {
      if (!chatId || !user?.id) return;
      
      const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
      
      if (chatIdRef.current !== chatIdNumber) {
        hasLoadedRef.current = false;
        setMessages([]);
      }
      
      loadMessages();
      
      // Connect WebSocket immediately (no delay)
      websocketService.connect(
        chatIdNumber,
        handleWebSocketMessage,
        (error) => console.error('[ChatScreen] OS WebSocket error:', error),
        () => isConnectedRef.current = false
      );
      isConnectedRef.current = true;
      
      return () => {
        websocketService.disconnect();
        isConnectedRef.current = false;
      };
    }, [chatId, user?.id, loadMessages, handleWebSocketMessage])
  );

  // Send Message
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (newMessages.length === 0 || !chatId || !user?.id) return;

    const message = newMessages[0];
    const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
    
    // Optimistic UI update removed to prevent duplicates with WebSocket echo
    // The socket message usually arrives immediately
    
    /* 
    const optimisticMessage: IMessage = {
      ...message,
      user: {
        ...message.user,
        _id: currentUserId,
        name: user?.full_name || 'Bạn',
        avatar: user?.avatar || undefined,
      },
    };
    
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [optimisticMessage])
    );
    */

    try {
      if (websocketService.isConnected()) {
        websocketService.sendMessage(message.text);
      } else {
        await chatService.sendMessage(chatIdNumber, message.text);
        loadMessages(); // Reload to confirm if not using socket or if socket failed silently
      }
    } catch (error: any) {
      console.error('[ChatScreen] Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn.');
     /*
      setMessages((previousMessages) =>
        previousMessages.filter(msg => msg._id !== optimisticMessage._id)
      );
      */
    }
  }, [chatId, user, currentUserId, loadMessages]);

  const handleCustomSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    
    const message: IMessage = {
      _id: Date.now().toString(),
      text,
      createdAt: new Date(),
      user: {
        _id: currentUserId,
        name: user?.full_name || 'Bạn',
        avatar: user?.avatar || undefined,
      },
    };
    await onSend([message]);
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Colors.primary,
            borderRadius: 20,
            borderBottomRightRadius: 4,
          },
          left: {
            backgroundColor: '#fff',
            borderRadius: 20,
            borderBottomLeftRadius: 4,
          },
        }}
        textStyle={{
          right: { color: '#FFFFFF' },
          left: { color: '#212121' },
        }}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.userInfo}>
              {targetAvatar ? (
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: targetAvatar }} style={styles.avatarImage} />
                  <View style={styles.onlineIndicator} />
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#fff" />
                  <View style={styles.onlineIndicator} />
                </View>
              )}
              <View style={styles.userInfoText}>
                <Text style={styles.userName}>{targetName}</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Đang hoạt động</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <View style={styles.iconButton}>
                <Ionicons name="call" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Anonymous Info Badge for Doctor */}
      {isDoctor && (
        <View style={styles.anonymousInfoBadge}>
          <Ionicons name="information-circle" size={16} color={Colors.primary} />
          <Text style={styles.anonymousInfoText}>
            Bạn đang trò chuyện với sinh viên.
          </Text>
        </View>
      )}

      {/* Messages */}
      {/* Messages */}
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={{
            _id: currentUserId,
            name: user?.full_name || 'Bạn',
            avatar: user?.avatar || undefined,
          }}
          renderBubble={renderBubble}
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
          renderInputToolbar={() => (
            <View style={[
              styles.customInputContainer,
              {
                marginBottom: Platform.OS === 'ios' ? 0 : 10, // Small adj for Android, iOS handles via safe area usually
                paddingBottom: 6,
                paddingTop: 6,
              }
            ]}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add-circle" size={28} color={Colors.primary} />
              </TouchableOpacity>
              
              <TextInput
                ref={inputRef}
                style={styles.customTextInput}
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              
              <TouchableOpacity 
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleCustomSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          minInputToolbarHeight={80} // Reserve space for custom toolbar
          bottomOffset={Platform.OS === 'ios' ? insets.bottom : 0} // Adjust for safe area
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerGradient: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: { marginRight: 12, position: 'relative' },
  avatarPlaceholder: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    marginRight: 12, position: 'relative',
  },
  avatarImage: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  onlineIndicator: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2, borderColor: '#fff',
  },
  userInfoText: { flex: 1 },
  userName: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 2 },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 6 },
  statusText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { marginLeft: 4 },
  iconButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  anonymousInfoBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  anonymousInfoText: { fontSize: 13, color: Colors.primary, marginLeft: 8 },
  chatContainer: { flex: 1, backgroundColor: '#f5f7fa' },
  messagesWrapper: { flex: 1 },
  customInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e0e0e0',
    gap: 8,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4,
    borderRadius: 24, // Rounded corners
    marginHorizontal: 16, // Side margins
  },
  attachButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center',
  },
  customTextInput: {
    flex: 1, color: '#212121', fontSize: 16,
    paddingHorizontal: 18, paddingVertical: 10,
    minHeight: 44, maxHeight: 100,
    backgroundColor: '#f5f5f5', borderRadius: 22,
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.5 },
});

export default ChatScreen;
