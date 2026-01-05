import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { doctorService, DoctorProfile } from '../../services/doctorService';
import { chatService } from '../../services/chatService';

const AllDoctorsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorService.getDoctors(1, 50);
      setDoctors(response.data || []);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
      Alert.alert('Lỗi', `Không thể tải danh sách bác sĩ. Vui lòng thử lại.\n${error?.message || 'Có lỗi xảy ra'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDoctors();
    }, [loadDoctors])
  );

  const handleStartChat = async (doctor: DoctorProfile) => {
    try {
      Alert.alert(
        'Bắt đầu chat',
        `Bạn có muốn bắt đầu chat với ${doctor.full_name}?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Bắt đầu',
            onPress: async () => {
              try {
                const chat = await chatService.createChat(doctor.id);
                // Navigate to chat screen
                (navigation as any).navigate('Chat', {
                  chatId: chat.id,
                  targetId: doctor.id,
                  targetName: doctor.full_name,
                  targetAvatar: doctor.avatar || undefined,
                  targetRole: 'DOCTOR',
                });
              } catch (error: any) {
                console.error('Error creating chat:', error);
                Alert.alert('Lỗi', `Không thể tạo chat. Vui lòng thử lại.\n${error?.message || 'Có lỗi xảy ra'}`);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error starting chat:', error);
      Alert.alert('Lỗi', `Không thể bắt đầu chat. Vui lòng thử lại.\n${error?.message || 'Có lỗi xảy ra'}`);
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Doctors</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
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

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách bác sĩ...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Bác sĩ' : 'Bác sĩ'} có sẵn
              </Text>

              {filteredDoctors.map((doctor) => (
                <View key={doctor.id} style={styles.doctorCard}>
                  {doctor.avatar ? (
                    <Image source={{ uri: doctor.avatar }} style={styles.doctorAvatarImage} />
                  ) : (
                    <View style={styles.doctorAvatar}>
                      <Ionicons name="person" size={40} color={Colors.primary} />
                    </View>
                  )}
                  <View style={styles.doctorInfo}>
                    <View style={styles.doctorHeader}>
                      <Text style={styles.doctorName}>{doctor.full_name}</Text>
                      {doctor.rating !== undefined && doctor.rating > 0 && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color={Colors.warning} />
                          <Text style={styles.rating}>{doctor.rating.toFixed(1)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.doctorSpecialty}>
                      {doctor.specialization || 'Chuyên gia tâm lý'}
                    </Text>
                    <View style={styles.doctorActions}>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => (navigation as any).navigate('DoctorDetail', { doctorId: doctor.id })}
                      >
                        <Text style={styles.viewButtonText}>Xem hồ sơ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => handleStartChat(doctor)}
                      >
                        <Ionicons name="chatbubbles" size={16} color={Colors.background} style={{ marginRight: 4 }} />
                        <Text style={styles.chatButtonText}>Chat</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {filteredDoctors.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>Không tìm thấy bác sĩ</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Thử điều chỉnh từ khóa tìm kiếm
                  </Text>
                </View>
              )}
            </>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  doctorAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  chatButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
  },
});

export default AllDoctorsScreen;

