import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';

const UpcomingAppointmentsScreen = () => {
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({
        limit: 100, // Get all appointments
      });
      
      // Filter upcoming appointments
      const now = new Date();
      const upcoming = (response.data || []).filter((apt) => {
        const appointmentDate = new Date(`${apt.appointment_date}T${apt.time_slot}`);
        return appointmentDate >= now && 
               (apt.status === 'PENDING' || apt.status === 'CONFIRMED');
      });
      
      // Sort by date (earliest first)
      upcoming.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date}T${a.time_slot}`);
        const dateB = new Date(`${b.appointment_date}T${b.time_slot}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      setAppointments(upcoming);
    } catch (error: any) {
      console.error('Error loading upcoming appointments:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lịch sắp tới');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [loadAppointments])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, [loadAppointments]);

  // Format date from YYYY-MM-DD to "MMM DD, YYYY"
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Đang chờ';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      default:
        return status.toLowerCase();
    }
  };

  const getAppointmentType = (notes?: string): 'video-call' | 'in-person' => {
    if (notes?.toLowerCase().includes('video')) {
      return 'video-call';
    }
    return 'in-person';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sắp tới</Text>
        <View style={styles.placeholder} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sắp tới...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            {appointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Chưa có lịch hẹn sắp tới</Text>
              </View>
            ) : (
              appointments.map((appointment) => {
                const appointmentType = getAppointmentType(appointment.notes);
                return (
                  <TouchableOpacity
                    key={appointment.id}
                    style={styles.appointmentCard}
                    onPress={() => navigation.navigate('AppointmentDetail' as never, { 
                      appointmentId: appointment.id 
                    } as never)}
                  >
                    <View style={styles.appointmentHeader}>
                      <View style={styles.doctorAvatar}>
                        {appointment.doctor?.avatar ? (
                          <Text style={styles.avatarText}>
                            {appointment.doctor.full_name.charAt(0).toUpperCase()}
                          </Text>
                        ) : (
                          <Ionicons name="person" size={24} color={Colors.primary} />
                        )}
                      </View>
                      <View style={styles.appointmentInfo}>
                        <Text style={styles.doctorName}>
                          {appointment.doctor?.full_name || 'Bác sĩ'}
                        </Text>
                        <Text style={styles.appointmentDate}>
                          {formatDate(appointment.appointment_date)} • {formatTime(appointment.time_slot)}
                        </Text>
                        <View style={styles.appointmentMeta}>
                          <View style={styles.typeBadge}>
                            <Ionicons
                              name={appointmentType === 'video-call' ? 'videocam' : 'location'}
                              size={12}
                              color={Colors.primary}
                            />
                            <Text style={styles.typeText}>
                              {appointmentType === 'video-call' ? 'Video Call' : 'In-person'}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: getStatusColor(appointment.status) + '20' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: getStatusColor(appointment.status) },
                              ]}
                            >
                              {getStatusLabel(appointment.status)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
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
  content: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  typeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default UpcomingAppointmentsScreen;

