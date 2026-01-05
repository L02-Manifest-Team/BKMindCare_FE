import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const { width } = Dimensions.get('window');

const CalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({
        limit: 100,
      });
      const allAppointments = response.data || [];
      setAppointments(allAppointments);

      // Filter upcoming appointments
      const now = new Date();
      const upcoming = allAppointments.filter((apt) => {
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

      setUpcomingAppointments(upcoming);
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lịch hẹn');
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

  const formatMonthYear = (date: Date) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateVietnamese = (date: Date) => {
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const months = [
      'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
      'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
    ];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const hasAppointment = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return appointments.some((apt) => apt.appointment_date === dateStr);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.appointment_date === dateStr);
  };

  const getStatusLabel = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Đang chờ';
      case 'CONFIRMED':
        return 'Đã xác nhận';
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

  const getAppointmentType = (notes?: string): 'video-call' | 'in-person' => {
    if (notes?.toLowerCase().includes('video')) {
      return 'video-call';
    }
    return 'in-person';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const calendarDays = getDaysInMonth(currentMonth);
  const selectedAppointments = getAppointmentsForDate(selectedDate);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>BKMindCare</Text>
            <Text style={styles.headerSubtitle}>Student Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Calendar Navigation */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => navigateMonth('prev')}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthYear}>{formatMonthYear(currentMonth)}</Text>
            <TouchableOpacity onPress={() => navigateMonth('next')}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDays}>
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <Text key={day} style={styles.weekDay}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.calendarDay} />;
              }
              const isSelectedDate = isSelected(date);
              const isTodayDate = isToday(date);
              const hasApt = hasAppointment(date);
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    isTodayDate && styles.todayDay,
                    isSelectedDate && styles.selectedDay,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelectedDate && styles.selectedDayText,
                      isTodayDate && !isSelectedDate && styles.todayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {hasApt && !isSelectedDate && (
                    <View style={styles.appointmentDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Appointments */}
        <View style={styles.appointmentsSection}>
          <Text style={styles.sectionTitle}>
            {formatDateVietnamese(selectedDate)}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : selectedAppointments.length > 0 ? (
            selectedAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => navigation.navigate('AppointmentDetail' as never, { 
                  appointmentId: appointment.id 
                } as never)}
              >
                <View style={styles.appointmentTimeContainer}>
                  <Ionicons name="time-outline" size={20} color={Colors.primary} />
                  <Text style={styles.appointmentTime}>{formatTime(appointment.time_slot)}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentDoctor}>
                    {appointment.doctor?.full_name || 'Bác sĩ'}
                  </Text>
                  <Text style={styles.appointmentType}>
                    {getAppointmentType(appointment.notes) === 'in-person' ? 'Trực tiếp' : 'Video call'}
                  </Text>
                  <View style={styles.appointmentStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(appointment.status) }
                    ]} />
                    <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Chưa có lịch hẹn</Text>
              <Text style={styles.emptyStateSubtext}>
                Chọn ngày có lịch hẹn để xem chi tiết
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.appointmentsSection}>
            <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
            {upcomingAppointments.slice(0, 5).map((appointment) => {
              const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.time_slot}`);
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => navigation.navigate('AppointmentDetail' as never, { 
                    appointmentId: appointment.id 
                  } as never)}
                >
                  <View style={styles.appointmentTimeContainer}>
                    <Ionicons name="time-outline" size={20} color={Colors.primary} />
                    <Text style={styles.appointmentTime}>{formatTime(appointment.time_slot)}</Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentDoctor}>
                      {appointment.doctor?.full_name || 'Bác sĩ'}
                    </Text>
                    <Text style={styles.appointmentDate}>
                      {formatDateVietnamese(appointmentDate)}
                    </Text>
                    <View style={styles.appointmentStatus}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(appointment.status) }
                      ]} />
                      <Text style={styles.statusText}>{getStatusLabel(appointment.status)}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
            {upcomingAppointments.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('UpcomingAppointments' as never)}
              >
                <Text style={styles.viewAllText}>Xem tất cả ({upcomingAppointments.length})</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Appointment' as never)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Đặt lịch hẹn mới</Text>
              <Text style={styles.quickActionSubtitle}>Lên lịch tư vấn</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AppointmentHistory' as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.purpleLight || Colors.primaryLight }]}>
              <Ionicons name="list" size={24} color={Colors.purple || Colors.primary} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Xem tất cả lịch hẹn</Text>
              <Text style={styles.quickActionSubtitle}>Xem lịch sử lịch hẹn</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
  },
  logo: {
    width: 72,
    height: 72,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  calendarSection: {
    backgroundColor: Colors.background,
    padding: 16,
    marginBottom: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: (width - 32) / 7,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: (width - 32) / 7,
    height: (width - 32) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  todayDay: {
    borderWidth: 1,
    borderColor: Colors.teal,
    borderRadius: (width - 32) / 14,
  },
  selectedDay: {
    backgroundColor: Colors.teal,
    borderRadius: (width - 32) / 14,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  todayText: {
    color: Colors.teal,
    fontWeight: '600',
  },
  selectedDayText: {
    color: Colors.background,
    fontWeight: '600',
  },
  appointmentDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  appointmentsSection: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionsSection: {
    padding: 16,
    paddingTop: 8,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionInfo: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default CalendarScreen;

