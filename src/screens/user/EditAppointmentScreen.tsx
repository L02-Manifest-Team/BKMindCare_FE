import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';

interface Doctor {
  id: number;
  full_name: string;
  specialization?: string;
  rating?: number;
  avatar?: string | null;
}

const EditAppointmentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const appointmentId = (route.params as any)?.appointmentId as number;

  const [appointment, setAppointment] = useState<AppointmentWithRelations | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video-call'>('in-person');
  const [selectedLocation, setSelectedLocation] = useState<'co-so-1' | 'co-so-2' | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const locations = [
    { id: 'co-so-1', name: 'Cơ sở 1', address: '268 Lý Thường Kiệt' },
    { id: 'co-so-2', name: 'Cơ sở 2', address: 'Dĩ An' },
  ];

  const loadAppointment = useCallback(async () => {
    if (!appointmentId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID cuộc hẹn');
      navigation.goBack();
      return;
    }

    try {
      setLoadingAppointment(true);
      const data = await appointmentService.getAppointmentDetail(appointmentId);
      setAppointment(data);
      setSelectedDate(data.appointment_date);
      setSelectedTime(data.time_slot);
      setReason(data.reason);
      
      // Determine appointment type from notes
      const isVideoCall = data.notes?.toLowerCase().includes('video');
      setAppointmentType(isVideoCall ? 'video-call' : 'in-person');
      
      // Extract location from notes if in-person
      if (!isVideoCall && data.notes) {
        if (data.notes.includes('268 Lý Thường Kiệt')) {
          setSelectedLocation('co-so-1');
        } else if (data.notes.includes('Dĩ An')) {
          setSelectedLocation('co-so-2');
        }
      }
    } catch (error: any) {
      console.error('Error loading appointment:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin cuộc hẹn');
      navigation.goBack();
    } finally {
      setLoadingAppointment(false);
    }
  }, [appointmentId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadAppointment();
    }, [loadAppointment])
  );

  const handleUpdateAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn đầy đủ: ngày và giờ');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập lý do đặt lịch');
      return;
    }

    if (appointmentType === 'in-person' && !selectedLocation) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa điểm');
      return;
    }

    setLoading(true);
    try {
      const locationInfo = appointmentType === 'in-person' && selectedLocation
        ? locations.find(loc => loc.id === selectedLocation)?.address || ''
        : '';
      
      const notes = appointmentType === 'video-call' 
        ? 'Video call appointment'
        : `In-person appointment - ${locationInfo}`;

      await appointmentService.updateAppointment(appointmentId, {
        reason: reason.trim(),
        notes: notes,
      });

      Alert.alert(
        'Thành công',
        'Lịch hẹn đã được cập nhật.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật lịch hẹn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingAppointment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Không tìm thấy cuộc hẹn</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa lịch hẹn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Appointment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hiện tại</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bác sĩ:</Text>
              <Text style={styles.infoValue}>{appointment.doctor?.full_name || 'Bác sĩ'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày:</Text>
              <Text style={styles.infoValue}>
                {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giờ:</Text>
              <Text style={styles.infoValue}>{appointment.time_slot}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái:</Text>
              <Text style={styles.infoValue}>
                {appointment.status === 'PENDING' ? 'Đang chờ' : 
                 appointment.status === 'CONFIRMED' ? 'Đã xác nhận' : appointment.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.warning} />
          <Text style={styles.noteText}>
            Lưu ý: Bạn chỉ có thể chỉnh sửa lý do và địa điểm. Để thay đổi ngày/giờ, vui lòng hủy và đặt lịch mới.
          </Text>
        </View>

        {/* Reason Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lý do đặt lịch *</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Nhập lý do bạn muốn gặp bác sĩ..."
            placeholderTextColor={Colors.textSecondary}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Appointment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại cuộc hẹn</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                appointmentType === 'in-person' && styles.selectedTypeOption,
              ]}
              onPress={() => setAppointmentType('in-person')}
            >
              <View style={styles.radioButton}>
                {appointmentType === 'in-person' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.typeText,
                  appointmentType === 'in-person' && styles.selectedTypeText,
                ]}
              >
                Trực tiếp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeOption,
                appointmentType === 'video-call' && styles.selectedTypeOption,
              ]}
              onPress={() => setAppointmentType('video-call')}
            >
              <View style={styles.radioButton}>
                {appointmentType === 'video-call' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text
                style={[
                  styles.typeText,
                  appointmentType === 'video-call' && styles.selectedTypeText,
                ]}
              >
                Video call
              </Text>
            </TouchableOpacity>
          </View>
          {appointmentType === 'in-person' && (
            <View style={styles.locationSelectionContainer}>
              <Text style={styles.locationTitle}>Chọn địa điểm *</Text>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationOption,
                    selectedLocation === location.id && styles.selectedLocationOption,
                  ]}
                  onPress={() => setSelectedLocation(location.id as 'co-so-1' | 'co-so-2')}
                >
                  <View style={styles.radioButton}>
                    {selectedLocation === location.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.locationInfo}>
                    <Text
                      style={[
                        styles.locationName,
                        selectedLocation === location.id && styles.selectedLocationText,
                      ]}
                    >
                      {location.name}
                    </Text>
                    <Text
                      style={[
                        styles.locationAddress,
                        selectedLocation === location.id && styles.selectedLocationAddress,
                      ]}
                    >
                      {location.address}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          title="Cập nhật lịch hẹn"
          onPress={handleUpdateAppointment}
          disabled={!reason.trim() || (appointmentType === 'in-person' && !selectedLocation)}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  noteSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.warning + '20',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
  reasonInput: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    marginRight: 12,
  },
  selectedTypeOption: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  typeText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedTypeText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  locationSelectionContainer: {
    marginTop: 12,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    marginBottom: 12,
  },
  selectedLocationOption: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedLocationText: {
    fontWeight: '600',
    color: Colors.primary,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  selectedLocationAddress: {
    color: Colors.text,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});

export default EditAppointmentScreen;

