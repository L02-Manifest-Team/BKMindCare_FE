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
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationService } from '../../services/notificationService';

interface Doctor {
  id: number;
  full_name: string;
  specialization?: string;
  rating?: number;
  avatar?: string | null;
}

const AppointmentScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video-call'>('in-person');
  const [selectedLocation, setSelectedLocation] = useState<'co-so-1' | 'co-so-2' | null>(null);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const locations = [
    { id: 'co-so-1', name: 'Cơ sở 1', address: '268 Lý Thường Kiệt' },
    { id: 'co-so-2', name: 'Cơ sở 2', address: 'Dĩ An' },
  ];

  const allTimeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Get available time slots based on selected date
  const getAvailableTimeSlots = useCallback(() => {
    if (!selectedDate) {
      return allTimeSlots;
    }

    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = selectedDateObj.toDateString() === today.toDateString();

    if (!isToday) {
      // If not today, all slots are available
      return allTimeSlots;
    }

    // If today, filter slots that are at least 2 hours from now
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const twoHoursFromNow = currentTimeInMinutes + 120; // 2 hours = 120 minutes

    return allTimeSlots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotTimeInMinutes = hours * 60 + minutes;
      return slotTimeInMinutes >= twoHoursFromNow;
    });
  }, [selectedDate]);

  const timeSlots = getAvailableTimeSlots();

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  // Reset selected time when date changes
  useEffect(() => {
    if (selectedDate) {
      const availableSlots = getAvailableTimeSlots();
      // If current selected time is not available, reset it
      if (selectedTime && !availableSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
    } else {
      // Reset time when date is cleared
      setSelectedTime('');
    }
  }, [selectedDate, getAvailableTimeSlots, selectedTime]);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await doctorService.getDoctors(1, 50);
      setDoctors(response.data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bác sĩ');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn đầy đủ: bác sĩ, ngày và giờ');
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

      const appointment = await appointmentService.createAppointment({
        doctor_id: selectedDoctor,
        appointment_date: selectedDate,
        time_slot: selectedTime,
        reason: reason.trim(),
        notes: notes,
      });

      // Create in-app notification
      const doctorName = doctor?.full_name || 'Bác sĩ';
      const appointmentDate = new Date(selectedDate).toLocaleDateString('vi-VN');
      const notificationTitle = 'Đã đặt lịch hẹn thành công';
      const notificationMessage = `Lịch hẹn với ${doctorName} vào ${appointmentDate} lúc ${selectedTime} đã được gửi. Chờ bác sĩ xác nhận.`;
      
      await addNotification({
        type: 'appointment',
        title: notificationTitle,
        message: notificationMessage,
        appointmentId: appointment.id,
      });

      // Send push notification
      await notificationService.sendPushNotification(
        notificationTitle,
        notificationMessage,
        {
          type: 'appointment',
          appointmentId: appointment.id,
        }
      );

      Alert.alert(
        'Thành công',
        'Lịch hẹn của bạn đã được gửi. Chờ bác sĩ xác nhận.',
        [
          {
            text: 'OK',
            onPress: () => (navigation as any).navigate('AppointmentHistory'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      // Parse error message
      let errorMessage = 'Không thể đặt lịch. Vui lòng thử lại.';
      if (error.message) {
        if (error.message.includes('not available')) {
          errorMessage = 'Bác sĩ không khả dụng ở khung giờ này. Vui lòng chọn khung giờ khác hoặc ngày khác.';
        } else if (error.message.includes('already have an appointment')) {
          errorMessage = 'Bạn đã có lịch hẹn ở khung giờ này. Vui lòng chọn khung giờ khác.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Không thể đặt lịch',
        errorMessage,
        [
          {
            text: 'Chọn khung giờ khác',
            onPress: () => setSelectedTime(''),
            style: 'default',
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const doctor = doctors.find((d) => d.id === selectedDoctor);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch hẹn</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Doctor Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn bác sĩ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadingDoctors ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
            ) : (
              doctors.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.doctorCard,
                  selectedDoctor === doc.id && styles.selectedDoctorCard,
                ]}
                onPress={() => setSelectedDoctor(doc.id)}
              >
                <View style={styles.doctorAvatarContainer}>
                  <Ionicons name="person" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.doctorName}>{doc.full_name}</Text>
                <Text style={styles.doctorSpecialty}>{doc.specialization || 'Chuyên gia'}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={12} color={Colors.warning} />
                  <Text style={styles.rating}>{doc.rating || 5.0}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
          </ScrollView>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn ngày</Text>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: Colors.success,
                selectedTextColor: Colors.background,
              },
            }}
            theme={{
              todayTextColor: Colors.primary,
              arrowColor: Colors.primary,
              selectedDayBackgroundColor: Colors.success,
              selectedDayTextColor: Colors.background,
            }}
            minDate={new Date().toISOString().split('T')[0]}
          />
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn giờ</Text>
          {!selectedDate ? (
            <View style={styles.warningContainer}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.warning} />
              <Text style={styles.warningText}>Vui lòng chọn ngày trước</Text>
            </View>
          ) : timeSlots.length === 0 ? (
            <View style={styles.warningContainer}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.error} />
              <Text style={styles.warningText}>
                Không còn khung giờ trống trong ngày hôm nay. Vui lòng chọn ngày khác.
              </Text>
            </View>
          ) : (
            <>
              {selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString() && (
                <View style={styles.infoContainer}>
                  <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
                  <Text style={styles.infoText}>
                    Phải đặt trước ít nhất 2 giờ. Các khung giờ dưới đây là khả dụng.
                  </Text>
                </View>
              )}
              <View style={styles.timeGrid}>
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        selectedTime === time && styles.selectedTimeText,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
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

        {/* Summary */}
        {selectedDate && selectedTime && selectedDoctor && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tóm tắt</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bác sĩ:</Text>
              <Text style={styles.summaryValue}>{doctor?.full_name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ngày:</Text>
              <Text style={styles.summaryValue}>
                {new Date(selectedDate).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giờ:</Text>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Loại:</Text>
              <Text style={styles.summaryValue}>
                {appointmentType === 'in-person' ? 'Trực tiếp' : 'Video call'}
              </Text>
            </View>
            {appointmentType === 'in-person' && selectedLocation && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Địa điểm:</Text>
                <Text style={styles.summaryValue}>
                  {locations.find(loc => loc.id === selectedLocation)?.name} - {locations.find(loc => loc.id === selectedLocation)?.address}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          title="Đặt lịch hẹn"
          onPress={handleBookAppointment}
          disabled={!selectedDate || !selectedTime || !selectedDoctor || (appointmentType === 'in-person' && !selectedLocation)}
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
  doctorCard: {
    width: 140,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  selectedDoctorCard: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  doctorAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: Colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '22%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTimeSlot: {
    backgroundColor: Colors.success,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: Colors.background,
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
  reasonInput: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    padding: 16,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    marginLeft: 8,
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default AppointmentScreen;

