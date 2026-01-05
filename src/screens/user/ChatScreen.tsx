import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Keyboard,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { GiftedChat, IMessage, Bubble, Send, InputToolbar, Composer } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { chatService, Message } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { websocketService } from '../../services/websocketService';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const chatIdRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const routeParams = route.params as any;
  const chatId = routeParams?.chatId;
  // For doctor view, we don't need doctorName/doctorAvatar from params
  // For patient view, we need doctorName/doctorAvatar
  const doctorName = routeParams?.doctorName || (user?.role === 'DOCTOR' ? undefined : 'Chuyên gia');
  const doctorAvatar = routeParams?.doctorAvatar;
  
  // Determine if current user is doctor
  const isDoctor = user?.role === 'DOCTOR';
  
  // Get current user ID in consistent format
  const currentUserId = user?.id ? String(user.id) : '0';

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

  // Load initial messages from API
  const loadMessages = useCallback(async () => {
    if (!chatId || !user?.id) {
      setLoading(false);
      return;
    }

    const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
    
    // Don't skip - always reload to ensure fresh data
    // The hasLoadedRef is just for showing loading state

    try {
      // Only show loading spinner on first load
      if (!hasLoadedRef.current || chatIdRef.current !== chatIdNumber) {
        setLoading(true);
      }
      
      chatIdRef.current = chatIdNumber;
      
      console.log('[ChatScreen] Loading messages for chat:', chatIdNumber);
      
      // Load only recent 50 messages for faster initial load
      const backendMessages = await chatService.getMessages(chatIdNumber, 0, 50);
      
      console.log('[ChatScreen] Loaded', backendMessages.length, 'messages');
      
      // Convert to GiftedChat format
      const giftedMessages: IMessage[] = backendMessages.map((msg: Message) => {
        // Parse date
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
        
        // Determine display name and avatar
        let displayName: string;
        let displayAvatar: string | undefined;
        
        if (isCurrentUser) {
          displayName = user?.full_name || (isDoctor ? 'Bác sĩ' : 'Bạn');
          displayAvatar = user?.avatar || undefined;
        } else {
          // Show real information for both doctor and patient
          if (isDoctor) {
            // Doctor viewing patient - get patient info from participants
            // This will be handled in loadMessages when we have chat participants
            displayName = 'Sinh viên';
            displayAvatar = undefined;
          } else {
            displayName = doctorName;
            displayAvatar = doctorAvatar;
          }
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
      
      // Reverse messages for GiftedChat (newest at bottom, oldest at top)
      const reversedMessages = giftedMessages.reverse();
      
      console.log('[ChatScreen] Setting', reversedMessages.length, 'messages to state');
      setMessages(reversedMessages);
      hasLoadedRef.current = true;
    } catch (error: any) {
      console.error('[ChatScreen] Error loading messages:', error);
      // Show alert if there's an error
      Alert.alert('Lỗi', 'Không thể tải tin nhắn. Vui lòng thử lại.');
      setMessages([]); // Clear messages on error
    } finally {
      setLoading(false);
    }
  }, [chatId, user, doctorName, doctorAvatar, isDoctor, currentUserId]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: Message) => {
    if (!user?.id || !chatIdRef.current) return;
    
    console.log('[ChatScreen] Received WebSocket message:', message.id, message.content.substring(0, 30));
    
    // Convert backend message to GiftedChat format
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
    
    // Determine display name and avatar
    let displayName: string;
    let displayAvatar: string | undefined;
    
    if (isCurrentUser) {
      displayName = user?.full_name || (isDoctor ? 'Bác sĩ' : 'Bạn');
      displayAvatar = user?.avatar || undefined;
    } else {
      if (isDoctor) {
        displayName = 'Sinh viên ẩn danh';
        displayAvatar = undefined;
      } else {
        displayName = doctorName;
        displayAvatar = doctorAvatar;
      }
    }
    
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
    
    // Check if message already exists (avoid duplicates)
    setMessages((previousMessages) => {
      const exists = previousMessages.some(msg => msg._id === newMessage._id);
      if (exists) {
        console.log('[ChatScreen] Duplicate message, skipping:', newMessage._id);
        return previousMessages;
      }
      
      // Add new message
      return GiftedChat.append(previousMessages, [newMessage]);
    });
  }, [user, doctorName, doctorAvatar, isDoctor, currentUserId]);

  // Set up WebSocket connection and load messages in parallel
  useFocusEffect(
    useCallback(() => {
      if (!chatId || !user?.id) {
        console.log('[ChatScreen] Missing chatId or user, skipping setup');
        return;
      }
      
      const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
      
      // Reset loaded flag if chat changed
      if (chatIdRef.current !== chatIdNumber) {
        console.log('[ChatScreen] Chat changed, resetting loaded flag');
        hasLoadedRef.current = false;
        setMessages([]); // Clear old messages
      }
      
      // Load messages first
      console.log('[ChatScreen] useFocusEffect: Loading messages for chat:', chatIdNumber);
      loadMessages();
      
      // Connect WebSocket (non-blocking, don't wait for it)
      setTimeout(() => {
        console.log('[ChatScreen] Connecting WebSocket to chat:', chatIdNumber);
        websocketService.connect(
          chatIdNumber,
          handleWebSocketMessage,
          (error) => {
            console.error('[ChatScreen] WebSocket error:', error);
          },
          () => {
            console.log('[ChatScreen] WebSocket closed');
            isConnectedRef.current = false;
          }
        );
        isConnectedRef.current = true;
      }, 100); // Small delay to prioritize message loading
      
      return () => {
        // Disconnect WebSocket when screen loses focus
        console.log('[ChatScreen] Disconnecting WebSocket');
        websocketService.disconnect();
        isConnectedRef.current = false;
      };
    }, [chatId, user?.id, loadMessages, handleWebSocketMessage])
  );

  // Send message
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (newMessages.length === 0 || !chatId || !user?.id) return;

    const message = newMessages[0];
    const chatIdNumber = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
    
    // Optimistically add to UI
    const optimisticMessage: IMessage = {
      ...message,
      user: {
        ...message.user,
        _id: currentUserId, // Ensure correct user ID
        name: user?.full_name || (isDoctor ? 'Bác sĩ' : 'Bạn'),
        avatar: user?.avatar || undefined,
      },
    };
    
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [optimisticMessage])
    );

    try {
      // Send via WebSocket if connected
      if (websocketService.isConnected()) {
        console.log('[ChatScreen] Sending message via WebSocket');
        websocketService.sendMessage(message.text);
        // Message will be replaced by server version via WebSocket callback
      } else {
        // Fallback to API
        console.log('[ChatScreen] WebSocket not connected, using API');
        await chatService.sendMessage(chatIdNumber, message.text);
        // Reload messages to get server version
        loadMessages();
      }
    } catch (error: any) {
      console.error('[ChatScreen] Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      // Remove optimistic message on error
      setMessages((previousMessages) =>
        previousMessages.filter(msg => msg._id !== optimisticMessage._id)
      );
    }
  }, [chatId, user, currentUserId, isDoctor, loadMessages]);

  // Render custom components
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Colors.primary,
            marginBottom: 8,
            marginRight: 4,
            borderRadius: 20,
            borderBottomRightRadius: 4,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: {
                elevation: 3,
              },
            }),
          },
          left: {
            backgroundColor: '#fff',
            marginBottom: 8,
            marginLeft: 4,
            borderRadius: 20,
            borderBottomLeftRadius: 4,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        }}
        textStyle={{
          right: {
            color: '#FFFFFF',
            fontSize: 15,
            lineHeight: 20,
          },
          left: {
            color: '#212121',
            fontSize: 15,
            lineHeight: 20,
          },
        }}
      />
    );
  };

  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Handle custom send
  const handleCustomSend = async () => {
    if (!inputText.trim() || !chatId || !user?.id) return;

    const text = inputText.trim();
    setInputText('');

    // Call onSend with the formatted message
    const message: IMessage = {
      _id: Date.now().toString(),
      text,
      createdAt: new Date(),
      user: {
        _id: currentUserId,
        name: user?.full_name || (isDoctor ? 'Bác sĩ' : 'Bạn'),
        avatar: user?.avatar || undefined,
      },
    };
    
    await onSend([message]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Modern Header with Gradient */}
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
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.userInfo}>
              {isDoctor ? (
                // Doctor viewing patient - show patient info
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={24} color="#fff" />
                  <View style={styles.onlineIndicator} />
                </View>
              ) : (
                // Patient viewing doctor
                doctorAvatar ? (
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: doctorAvatar }}
                      style={styles.doctorAvatarImage}
                    />
                    <View style={styles.onlineIndicator} />
                  </View>
                ) : (
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={24} color="#fff" />
                    <View style={styles.onlineIndicator} />
                  </View>
                )
              )}
              <View style={styles.userInfoText}>
                <Text style={styles.userName}>
                  {isDoctor ? 'Sinh viên' : doctorName}
                </Text>
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Đang hoạt động</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconButton}>
                <Ionicons name="call" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconButton}>
                <Ionicons name="videocam" size={20} color={Colors.primary} />
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
            Bạn đang chat với sinh viên ẩn danh.
          </Text>
        </View>
      )}

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.messagesWrapper}>
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{
              _id: currentUserId,
              name: user?.full_name || (isDoctor ? 'Bác sĩ' : 'Bạn'),
              avatar: user?.avatar || undefined,
            }}
            renderBubble={renderBubble}
            renderInputToolbar={() => null} // Hide default input toolbar
            minInputToolbarHeight={0}
            alwaysShowSend
            showUserAvatar
            showAvatarForEveryMessage
          />
        </View>

        {/* Custom Input Bar - Fixed at bottom */}
        <View style={[
          styles.customInputContainer,
          {
            paddingBottom: Platform.OS === 'ios' 
              ? (keyboardHeight > 0 ? 10 : insets.bottom + 10)
              : 10,
            marginBottom: Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 0,
          }
        ]}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
          
          <TextInput
            ref={inputRef}
            style={styles.customTextInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            textAlignVertical="center"
          />
          
          <TouchableOpacity 
            style={[styles.sendButtonCustom, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleCustomSend}
            activeOpacity={0.7}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? [Colors.primary, Colors.secondary] : ['#ccc', '#aaa']}
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  headerGradient: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  doctorAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    marginLeft: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  messagesWrapper: {
    flex: 1,
  },
  anonymousInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  anonymousInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
    lineHeight: 18,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customTextInput: {
    flex: 1,
    color: '#212121',
    fontSize: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sendButtonCustom: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;
