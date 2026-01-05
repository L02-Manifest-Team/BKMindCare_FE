import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const AppointmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const appointmentId = (route.params as any)?.appointmentId as number;
  
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAppointment = useCallback(async () => {
    if (!appointmentId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID cuộc hẹn');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const data = await appointmentService.getAppointmentDetail(appointmentId);
      setAppointment(data);
    } catch (error: any) {
      console.error('Error loading appointment:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết cuộc hẹn');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [appointmentId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadAppointment();
    }, [loadAppointment])
  );

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
  ];

  // Format date from YYYY-MM-DD to "DD MMM YYYY"
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  };

  // Format time from HH:MM to "HH:MM AM/PM"
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.success;
      case 'PENDING':
        return Colors.warning || Colors.textSecondary;
      case 'COMPLETED':
        return Colors.primary;
      case 'CANCELLED':
      case 'REJECTED':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PENDING':
        return 'Đang chờ';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getAppointmentType = (notes?: string): 'video-call' | 'in-person' => {
    if (notes?.toLowerCase().includes('video')) {
      return 'video-call';
    }
    return 'in-person';
  };

  const handleCancel = async () => {
    if (!appointment) return;
    
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy cuộc hẹn này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentService.cancelAppointment(appointment.id);
              Alert.alert('Thành công', 'Cuộc hẹn đã được hủy');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy cuộc hẹn');
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    if (!appointment) return;
    (navigation as any).navigate('EditAppointment', { appointmentId: appointment.id });
  };

  const handleJoinCall = () => {
    // TODO: Implement join video call
    console.log('Join video call');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cuộc hẹn</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      ) : !appointment ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Không tìm thấy cuộc hẹn</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(appointment.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>

          {/* Doctor Info */}
          <View style={styles.doctorSection}>
            <View style={styles.doctorAvatarContainer}>
              {appointment.doctor?.avatar ? (
                <Image
                  source={{ uri: appointment.doctor.avatar }}
                  style={styles.doctorAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.doctorAvatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {appointment.doctor?.full_name?.charAt(0).toUpperCase() || 'D'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{appointment.doctor?.full_name || 'Bác sĩ'}</Text>
              <Text style={styles.doctorSpecialization}>
                {appointment.doctor?.doctor_profile?.specialization || 'Bác sĩ tâm lý'}
              </Text>
            </View>
          </View>

        {/* Appointment Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin cuộc hẹn</Text>

          {/* Date */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailValue}>{formatDate(appointment.appointment_date)}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailValue}>{formatTime(appointment.time_slot)}</Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="hourglass-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Thời lượng</Text>
              <Text style={styles.detailValue}>60 phút</Text>
            </View>
          </View>

          {/* Type */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons
                name={getAppointmentType(appointment.notes || undefined) === 'video-call' ? 'videocam-outline' : 'location-outline'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Loại cuộc hẹn</Text>
              <Text style={styles.detailValue}>
                {getAppointmentType(appointment.notes || undefined) === 'video-call' ? 'Video call' : 'Trực tiếp'}
              </Text>
            </View>
          </View>

          {/* Reason */}
          {appointment.reason && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Lý do</Text>
                <Text style={styles.detailValue}>{appointment.reason}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Session Details */}
        {appointment.notes && (
          <View style={styles.sessionSection}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionDescription}>{appointment.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
          <View style={styles.actionsSection}>
            {getAppointmentType(appointment.notes || undefined) === 'video-call' && appointment.status === 'CONFIRMED' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinButton]}
                onPress={handleJoinCall}
              >
                <Ionicons name="videocam" size={20} color={Colors.background} />
                <Text style={styles.joinButtonText}>Tham gia cuộc gọi</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={handleReschedule}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={styles.rescheduleButtonText}>Đổi lịch</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
              <Text style={styles.cancelButtonText}>Hủy cuộc hẹn</Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      )}

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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusSection: {
    padding: 16,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  doctorAvatarContainer: {
    marginRight: 16,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  doctorAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  detailsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  sessionSection: {
    padding: 16,
    paddingTop: 0,
  },
  sessionCard: {
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
  },
  sessionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sessionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionsSection: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  rescheduleButton: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  rescheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default AppointmentDetailScreen;

