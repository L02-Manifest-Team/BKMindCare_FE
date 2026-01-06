import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';

const DoctorAppointmentReviewScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Load pending appointments
  const loadPendingAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({
        status: 'PENDING',
        limit: 100,
      });
      
      // Sort by date (earliest first)
      const sorted = response.data.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.time_slot}`);
        const dateB = new Date(`${b.appointment_date}T${b.time_slot}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(sorted);
    } catch (error: any) {
      console.error('Error loading pending appointments:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPendingAppointments();
    }, [loadPendingAppointments])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPendingAppointments();
  }, [loadPendingAppointments]);

  // Approve appointment
  const handleApprove = async (appointment: AppointmentWithRelations) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn chấp nhận lịch hẹn với ${appointment.patient?.full_name || 'bệnh nhân'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Chấp nhận',
          onPress: async () => {
            try {
              setProcessingId(appointment.id);
              await appointmentService.approveAppointment(appointment.id);
              
              // Send notification to student
              const patientId = appointment.patient_id;
              if (patientId) {
                await sendNotificationToStudent(
                  patientId,
                  'appointment',
                  'Lịch hẹn đã được xác nhận',
                  `Lịch hẹn của bạn với bác sĩ ${user?.full_name || ''} vào ${formatDate(appointment.appointment_date)} lúc ${appointment.time_slot} đã được xác nhận.`,
                  appointment.id
                );
              }
              
              Alert.alert('Thành công', 'Đã chấp nhận lịch hẹn và gửi thông báo đến sinh viên');
              loadPendingAppointments();
            } catch (error: any) {
              console.error('Error approving appointment:', error);
              Alert.alert('Lỗi', error.message || 'Không thể chấp nhận lịch hẹn');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // Reject appointment
  const handleReject = async (appointment: AppointmentWithRelations) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn từ chối lịch hẹn với ${appointment.patient?.full_name || 'bệnh nhân'}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(appointment.id);
              await appointmentService.rejectAppointment(appointment.id);
              
              // Send notification to student
              const patientId = appointment.patient_id;
              if (patientId) {
                await sendNotificationToStudent(
                  patientId,
                  'appointment',
                  'Lịch hẹn đã bị từ chối',
                  `Lịch hẹn của bạn với bác sĩ ${user?.full_name || ''} vào ${formatDate(appointment.appointment_date)} lúc ${appointment.time_slot} đã bị từ chối.`,
                  appointment.id
                );
              }
              
              Alert.alert('Thành công', 'Đã từ chối lịch hẹn và gửi thông báo đến sinh viên');
              loadPendingAppointments();
            } catch (error: any) {
              console.error('Error rejecting appointment:', error);
              Alert.alert('Lỗi', error.message || 'Không thể từ chối lịch hẹn');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // Send notification to student
  // Note: In production, this should be done via backend API
  // The backend would store the notification in the database and send push notification
  const sendNotificationToStudent = async (
    studentId: number,
    type: 'appointment' | 'message',
    title: string,
    message: string,
    appointmentId?: number
  ) => {
    try {
      // In production, call backend API:
      // await api.post('/notifications/', {
      //   user_id: studentId,
      //   type,
      //   title,
      //   message,
      //   appointment_id: appointmentId,
      // });
      
      // For now, just send push notification
      // The backend should handle storing the notification in database
      await notificationService.sendPushNotification(title, message, {
        type,
        appointmentId,
        userId: studentId,
      });
      
      if (__DEV__) {
        console.log('Notification sent to student:', {
          studentId,
          title,
          message,
          appointmentId,
        });
      }
    } catch (error) {
      console.error('Error sending notification to student:', error);
      // Don't throw - notification sending failure shouldn't block appointment update
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot;
  };

  const getAppointmentType = (notes: string | null) => {
    if (!notes) return 'anonymous-chat';
    if (notes.includes('Cơ sở 1') || notes.includes('Cơ sở 2')) {
      return 'in-person';
    }
    if (notes.toLowerCase().includes('anonymous chat')) {
      return 'anonymous-chat';
    }
    return 'anonymous-chat';
  };

  const getAppointmentLocation = (notes: string | null) => {
    if (!notes) return undefined;
    if (notes.includes('Cơ sở 1')) {
      return 'Cơ sở 1 (268 Lý Thường Kiệt)';
    }
    if (notes.includes('Cơ sở 2')) {
      return 'Cơ sở 2 (Dĩ An)';
    }
    return undefined;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xét duyệt lịch hẹn</Text>
        <View style={styles.headerPlaceholder} />
      </View>

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
        ) : appointments.length > 0 ? (
          <>
            <View style={styles.infoSection}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                Có {appointments.length} lịch hẹn đang chờ xét duyệt
              </Text>
            </View>
            
            {appointments.map((appointment) => {
              const appointmentType = getAppointmentType(appointment.notes);
              const location = getAppointmentLocation(appointment.notes);
              const isProcessing = processingId === appointment.id;
              
              return (
                <View key={appointment.id} style={styles.appointmentCard}>
                  {/* Patient Info */}
                  <View style={styles.patientSection}>
                    <View style={styles.patientAvatar}>
                      {appointment.patient?.avatar ? (
                        <Image 
                          source={{ uri: appointment.patient.avatar }} 
                          style={styles.avatarImage} 
                        />
                      ) : (
                        <Ionicons name="person" size={24} color={Colors.primary} />
                      )}
                    </View>
                    <View style={styles.patientInfo}>
                      <Text style={styles.patientName}>
                        {appointment.patient?.full_name || 'Bệnh nhân'}
                      </Text>
                      <Text style={styles.patientEmail}>
                        {appointment.patient?.email || ''}
                      </Text>
                    </View>
                  </View>

                  {/* Appointment Details */}
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.detailText}>
                        {formatDate(appointment.appointment_date)} lúc {formatTime(appointment.time_slot)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Ionicons
                        name={appointmentType === 'anonymous-chat' ? 'chatbubbles-outline' : 'location-outline'}
                        size={16}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.detailText}>
                        {appointmentType === 'anonymous-chat' ? 'Chat ẩn danh' : location || 'Trực tiếp'}
                      </Text>
                    </View>
                    
                    {appointment.reason && (
                      <View style={styles.detailRow}>
                        <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                        <Text style={styles.detailText}>{appointment.reason}</Text>
                      </View>
                    )}
                    
                    {appointment.notes && (
                      <View style={styles.noteContainer}>
                        <Text style={styles.noteLabel}>Ghi chú:</Text>
                        <Text style={styles.noteText}>{appointment.notes}</Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(appointment)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={Colors.error} />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={20} color={Colors.error} />
                          <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(appointment)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color={Colors.background} />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                          <Text style={styles.approveButtonText}>Chấp nhận</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>Không có lịch hẹn nào cần xét duyệt</Text>
            <Text style={styles.emptySubtext}>
              Tất cả lịch hẹn đã được xử lý
            </Text>
          </View>
        )}
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
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  patientEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  noteContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DoctorAppointmentReviewScreen;

