import React, { useState, useEffect, useCallback } from 'react';
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

const AppointmentHistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({
        limit: 100, // Get all appointments
      });
      setAppointments(response.data || []);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lịch sử lịch hẹn');
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

  // Format date from YYYY-MM-DD to "DD/MM/YYYY"
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time from HH:MM to "HH:MM AM/PM"
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Determine if appointment is upcoming or past
  const isUpcoming = (appointment: AppointmentWithRelations): boolean => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.time_slot}`);
    return appointmentDate >= new Date() && 
           (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED');
  };

  const isPast = (appointment: AppointmentWithRelations): boolean => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.time_slot}`);
    return appointmentDate < new Date() || appointment.status === 'COMPLETED';
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'upcoming') return isUpcoming(apt);
    return isPast(apt);
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.success;
      case 'COMPLETED':
        return Colors.primary;
      case 'CANCELLED':
      case 'REJECTED':
        return Colors.error;
      case 'PENDING':
        return Colors.warning || Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return status.toLowerCase();
    }
  };

  const getAppointmentType = (notes?: string): 'anonymous-chat' | 'in-person' => {
    if (notes?.toLowerCase().includes('anonymous chat')) {
      return 'anonymous-chat';
    }
    return 'in-person';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử cuộc hẹn</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'upcoming', 'past'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.selectedFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.selectedFilterText,
              ]}
            >
              {filter === 'all' ? 'Tất cả' : filter === 'upcoming' ? 'Sắp tới' : 'Đã qua'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            {filteredAppointments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>Chưa có lịch hẹn nào</Text>
              </View>
            ) : (
              filteredAppointments.map((appointment) => {
                const appointmentType = getAppointmentType(appointment.notes || undefined);
                return (
                  <TouchableOpacity
                    key={appointment.id}
                    style={styles.appointmentCard}
                    onPress={() => (navigation as any).navigate('AppointmentDetail', { 
                      appointmentId: appointment.id 
                    })}
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
                              name={appointmentType === 'anonymous-chat' ? 'chatbubbles' : 'location'}
                              size={12}
                              color={Colors.primary}
                            />
                            <Text style={styles.typeText}>
                              {appointmentType === 'anonymous-chat' ? 'Chat ẩn danh' : 'Trực tiếp'}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
  },
  selectedFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: Colors.background,
    fontWeight: '600',
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
    textTransform: 'capitalize',
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
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default AppointmentHistoryScreen;
