import React, { useState, useCallback } from 'react';
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
import { AppointmentPopup } from '../../components/AppointmentPopup';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';

const DoctorAppointmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const routeParams = route.params as any;
  
  const appointmentId = routeParams?.appointmentId;
  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfirmSuccessPopup, setShowConfirmSuccessPopup] = useState(false);
  const [showRejectConfirmPopup, setShowRejectConfirmPopup] = useState(false);
  const [showRejectSuccessPopup, setShowRejectSuccessPopup] = useState(false);

  // Load appointment detail
  const loadAppointmentDetail = useCallback(async () => {
    if (!appointmentId) return;
    
    try {
      setLoading(true);
      const detail = await appointmentService.getAppointmentDetail(appointmentId);
      setAppointment(detail);
    } catch (error) {
      console.error('Error loading appointment detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cuộc hẹn');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useFocusEffect(
    useCallback(() => {
      loadAppointmentDetail();
    }, [loadAppointmentDetail])
  );

  const handleConfirm = async () => {
    if (!appointmentId) return;
    
    try {
      setUpdating(true);
      await appointmentService.approveAppointment(appointmentId);
      setShowConfirmSuccessPopup(true);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận cuộc hẹn');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmSuccessClose = () => {
    setShowConfirmSuccessPopup(false);
    loadAppointmentDetail();
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const handleReject = () => {
    setShowRejectConfirmPopup(true);
  };

  const handleRejectConfirm = async () => {
    if (!appointmentId) return;
    
    try {
      setUpdating(true);
      setShowRejectConfirmPopup(false);
      await appointmentService.rejectAppointment(appointmentId);
      setShowRejectSuccessPopup(true);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      Alert.alert('Lỗi', 'Không thể từ chối cuộc hẹn');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectSuccessClose = () => {
    setShowRejectSuccessPopup(false);
    loadAppointmentDetail();
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return Colors.success;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return 'Đang chờ';
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

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Không tìm thấy cuộc hẹn</Text>
      </View>
    );
  }

  const appointmentType = getAppointmentType(appointment.notes);
  const location = getAppointmentLocation(appointment.notes);

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

        {/* Patient Info */}
        <View style={styles.patientSection}>
          <View style={styles.patientAvatar}>
            {appointment.patient?.avatar ? (
              <Image 
                source={{ uri: appointment.patient.avatar }} 
                style={styles.avatarImage} 
              />
            ) : (
              <Ionicons name="person" size={40} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.patientName}>
            {appointment.patient?.full_name || 'Bệnh nhân'}
          </Text>
          <Text style={styles.patientLabel}>Sinh viên</Text>
          {appointment.reason && (
            <View style={styles.tagsContainer}>
              <View style={[styles.tag, { backgroundColor: Colors.primary }]}>
                <Text style={styles.tagText}>{appointment.reason}</Text>
              </View>
            </View>
          )}
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

          {/* Type */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons
                name={appointmentType === 'anonymous-chat' ? 'chatbubbles-outline' : 'location-outline'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Loại cuộc hẹn</Text>
              <Text style={styles.detailValue}>
                {appointmentType === 'anonymous-chat' ? 'Chat ẩn danh' : 'Trực tiếp'}
              </Text>
            </View>
          </View>

          {/* Location (if in-person) */}
          {appointmentType === 'in-person' && location && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Địa điểm</Text>
                <Text style={styles.detailValue}>{location}</Text>
              </View>
            </View>
          )}

          {/* Notes */}
          {appointment.notes && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ghi chú</Text>
                <Text style={styles.detailValue}>{appointment.notes}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {appointment.status === 'PENDING' && (
        <View style={[styles.actionsSection, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color={Colors.error} />
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color={Colors.error} />
                <Text style={styles.rejectButtonText}>Từ chối</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Popups */}
      <AppointmentPopup
        visible={showConfirmSuccessPopup}
        type="success-confirm"
        onClose={handleConfirmSuccessClose}
      />
      <AppointmentPopup
        visible={showRejectConfirmPopup}
        type="confirm-reject"
        onClose={() => setShowRejectConfirmPopup(false)}
        onConfirm={handleRejectConfirm}
      />
      <AppointmentPopup
        visible={showRejectSuccessPopup}
        type="success-reject"
        onClose={handleRejectSuccessClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
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
  patientSection: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  patientAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  patientLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
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
  actionsSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});

export default DoctorAppointmentDetailScreen;
