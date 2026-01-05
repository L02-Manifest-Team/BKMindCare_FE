import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { journalService, JournalEntry } from '../../services/journalService';

const JournalScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    try {
      setLoading(true);
      console.log('Loading journal entries...');
      const response = await journalService.getEntries(0, 50);
      console.log('Journal response:', response);
      
      if (response && response.data) {
        setEntries(response.data);
      } else if (response && Array.isArray(response)) {
        // Nếu response là array trực tiếp
        setEntries(response);
      } else {
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Error loading entries:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      // Nếu là lỗi 404 hoặc Not Found, có thể là chưa có entries
      if (error.message && (error.message.includes('Not Found') || error.message.includes('404'))) {
        console.log('No entries found or endpoint not available');
        setEntries([]);
      } else if (error.message && error.message.includes('401') || error.message.includes('Unauthorized')) {
        Alert.alert('Lỗi xác thực', 'Vui lòng đăng nhập lại.');
      } else {
        // Chỉ hiển thị alert cho các lỗi khác
        const errorMsg = error.message || 'Không thể tải nhật ký. Vui lòng thử lại.';
        console.error('Journal loading error:', errorMsg);
        // Không hiển thị alert để tránh spam, chỉ log
        setEntries([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const saveEntry = async () => {
    if (!newEntry.trim()) {
      Alert.alert('Thông báo', 'Vui lòng viết gì đó trước khi lưu');
      return;
    }

    setSaving(true);
    try {
      const newJournal = await journalService.createEntry({
        content: newEntry.trim(),
      });

      setEntries([newJournal, ...entries]);
      setNewEntry('');
      Alert.alert('Đã lưu! 💛', 'Cảm ơn bạn đã chia sẻ. Mỗi dòng nhật ký là một bước để hiểu bản thân hơn.');
    } catch (error: any) {
      console.error('Error saving entry:', error);
      const errorMessage = error.message || 'Không thể lưu nhật ký. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (journalId: number) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa nhật ký này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await journalService.deleteEntry(journalId);
              setEntries(entries.filter(e => e.id !== journalId));
            } catch (error: any) {
              console.error('Error deleting entry:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa nhật ký');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string | any) => {
    try {
      // Handle both string and datetime formats
      let date: Date;
      if (typeof dateStr === 'string') {
        date = new Date(dateStr);
      } else if (dateStr && typeof dateStr === 'object') {
        // If it's already a Date object or datetime object
        date = new Date(dateStr);
      } else {
        date = new Date();
      }
      
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const hour = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} lúc ${hour}:${min}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateStr);
      return 'Ngày không hợp lệ';
    }
  };

  const prompts = [
    '💭 Hôm nay điều gì khiến bạn suy nghĩ?',
    '🌟 Điều tích cực nhất hôm nay là gì?',
    '😔 Bạn đang lo lắng về điều gì?',
    '💪 Bạn đã vượt qua khó khăn gì?',
    '🙏 Bạn biết ơn điều gì hôm nay?',
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhật ký của tôi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Write Section */}
        <LinearGradient
          colors={['#FFF8E1', '#FFECB3']}
          style={styles.writeSection}
        >
          <View style={styles.writeSectionHeader}>
            <Ionicons name="pencil" size={20} color="#F57C00" />
            <Text style={styles.writeSectionTitle}>Viết nhật ký</Text>
          </View>
          
          {/* Prompts */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promptsContainer}
          >
            {prompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptChip}
                onPress={() => setNewEntry(prompt.substring(2) + '\n\n')}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.textInput}
            placeholder="Hôm nay bạn muốn chia sẻ điều gì? 💛"
            placeholderTextColor="#999"
            value={newEntry}
            onChangeText={setNewEntry}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveEntry}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Lưu nhật ký</Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Entries List */}
        <View style={styles.entriesSection}>
          <Text style={styles.entriesTitle}>📝 Nhật ký gần đây ({entries.length})</Text>
          
          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>Chưa có nhật ký nào</Text>
              <Text style={styles.emptySubtext}>Bắt đầu viết điều gì đó để lưu giữ khoảnh khắc</Text>
            </View>
          ) : (
            entries.map((entry) => {
              // Handle both string and datetime formats
              let dateStr = entry.created_at;
              if (typeof entry.created_at === 'object' && entry.created_at !== null) {
                // If it's a datetime object, convert to string
                dateStr = entry.created_at.toString();
              }
              
              return (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDateRow}>
                      <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.entryDate}>{formatDate(dateStr)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.entryContent}>{entry.content}</Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  // Write Section
  writeSection: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  writeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  writeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
  },
  promptsContainer: {
    marginBottom: 12,
    marginHorizontal: -4,
  },
  promptChip: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  promptText: {
    fontSize: 13,
    color: '#E65100',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Entries Section
  entriesSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  entryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  entryContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
});

export default JournalScreen;
