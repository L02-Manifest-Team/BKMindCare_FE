import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import { AppointmentPopup } from '../../components/AppointmentPopup';
import { AppointmentType } from '../../types';

const DoctorAppointmentDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const routeParams = route.params as any;
  
  const appointmentId = routeParams?.appointmentId;
  const patientName = routeParams?.patientName || 'Truc Quynh';
  const appointmentDate = routeParams?.date || '2024-10-17';
  const appointmentTime = routeParams?.time || '16:00';
  const appointmentType = (routeParams?.type || 'in-person') as AppointmentType;
  const location = routeParams?.location || 'BK.B6';
  const duration = routeParams?.duration || '60 minutes';
  const tags = routeParams?.tags || ['Anxiety'];

  const [status, setStatus] = useState<'pending' | 'confirmed' | 'rejected'>('pending');
  const [showConfirmSuccessPopup, setShowConfirmSuccessPopup] = useState(false);
  const [showRejectConfirmPopup, setShowRejectConfirmPopup] = useState(false);
  const [showRejectSuccessPopup, setShowRejectSuccessPopup] = useState(false);

  const handleConfirm = () => {
    setShowConfirmSuccessPopup(true);
  };

  const handleConfirmSuccessClose = () => {
    setShowConfirmSuccessPopup(false);
    setStatus('confirmed');
    // TODO: Update appointment status in database
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const handleReject = () => {
    setShowRejectConfirmPopup(true);
  };

  const handleRejectConfirm = () => {
    setShowRejectConfirmPopup(false);
    setShowRejectSuccessPopup(true);
  };

  const handleRejectSuccessClose = () => {
    setShowRejectSuccessPopup(false);
    setStatus('rejected');
    // TODO: Update appointment status in database
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.warning;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return 'Đang chờ';
    }
  };

  const getTagColor = (tag: string) => {
    const tagColors: { [key: string]: string } = {
      'Anxiety': Colors.blue,
      'Pressure': Colors.purple,
      'Stress': Colors.success,
      'Relationship Issues Chat': Colors.pink,
    };
    return tagColors[tag] || Colors.primary;
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.patientSection}>
          <View style={styles.patientAvatar}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.patientName}>{patientName}</Text>
          <Text style={styles.patientLabel}>student</Text>
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag: string, index: number) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Appointment Details - Read Only */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin cuộc hẹn</Text>

          {/* Date */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày</Text>
              <Text style={styles.detailValue}>{appointmentDate}</Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Giờ</Text>
              <Text style={styles.detailValue}>{appointmentTime}</Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="hourglass-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Thời lượng</Text>
              <Text style={styles.detailValue}>{duration}</Text>
            </View>
          </View>

          {/* Type */}
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons
                name={appointmentType === 'video-call' ? 'videocam-outline' : 'location-outline'}
                size={20}
                color={Colors.primary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Loại cuộc hẹn</Text>
              <Text style={styles.detailValue}>
                {appointmentType === 'video-call' ? 'Video call' : 'Trực tiếp'}
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
        </View>

        {/* Note */}
      </ScrollView>

      {/* Action Buttons */}
      {status === 'pending' && (
        <View style={[styles.actionsSection, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <Ionicons name="close-circle" size={20} color={Colors.error} />
            <Text style={styles.rejectButtonText}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirm}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.background} />
            <Text style={styles.confirmButtonText}>Xác nhận</Text>
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
  noteSection: {
    padding: 16,
    paddingTop: 0,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
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

