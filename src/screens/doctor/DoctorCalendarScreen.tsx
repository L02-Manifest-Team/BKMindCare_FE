import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';

const { width } = Dimensions.get('window');

const DoctorCalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
  ];

  // Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getAppointments({ limit: 200 });
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

      setUpcomingAppointments(upcoming.slice(0, 5)); // Show only first 5
    } catch (error: any) {
      console.error('Error loading appointments:', error);
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatMonthYear = (date: Date) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
    const dateStr = date.toISOString().split('T')[0];
    return appointments.some((apt) => apt.appointment_date === dateStr);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt) => apt.appointment_date === dateStr);
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
  const filteredAppointments = selectedAppointments.filter((apt) => {
    const patientName = apt.patient?.full_name || '';
    const reason = apt.reason || '';
    return patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           reason.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTagColor = (tag: string) => {
    const tagColors: { [key: string]: string } = {
      'Anxiety': Colors.blue,
      'Pressure': Colors.purple,
      'Stress': Colors.success,
      'Relationship Issues Chat': Colors.pink,
    };
    return tagColors[tag] || Colors.primary;
  };

  const getCardBackgroundColor = (index: number) => {
    const colors = [Colors.blueLight, Colors.purpleLight, Colors.greenLight];
    return colors[index % colors.length];
  };

  const getAppointmentType = (notes: string | null) => {
    if (!notes) return 'online';
    if (notes.includes('Cơ sở 1') || notes.includes('Cơ sở 2')) {
      return 'offline';
    }
    return 'online';
  };

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
            <Text style={styles.headerSubtitle}>Expert Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="people" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cuộc hẹn..."
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
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Upcoming Appointments Section */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Text style={styles.upcomingTitle}>Lịch sắp tới</Text>
              <TouchableOpacity 
                onPress={() => {
                  // Navigate to all upcoming appointments if needed
                }}
              >
                <Text style={styles.viewAllText}>Xem tất cả →</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map((appointment, index) => {
              const appointmentType = getAppointmentType(appointment.notes);
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.upcomingCard}
                  onPress={() => (navigation as any).navigate('DoctorAppointmentDetail', {
                    appointmentId: appointment.id,
                  })}
                  activeOpacity={0.7}
                >
                  <View style={styles.upcomingContent}>
                    <View style={styles.upcomingDateContainer}>
                      <Text style={styles.upcomingDay}>
                        {new Date(appointment.appointment_date).getDate()}
                      </Text>
                      <Text style={styles.upcomingMonth}>
                        {new Date(appointment.appointment_date).toLocaleDateString('vi-VN', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.upcomingInfo}>
                      <Text style={styles.upcomingPatient}>
                        {appointment.patient?.full_name || 'Bệnh nhân'}
                      </Text>
                      <Text style={styles.upcomingTime}>
                        {appointment.time_slot} • {appointmentType === 'offline' ? 'Trực tiếp' : 'Video call'}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
            {selectedDate.toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => {
              const appointmentType = getAppointmentType(appointment.notes);
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={[
                    styles.appointmentCard,
                    { backgroundColor: getCardBackgroundColor(index) }
                  ]}
                  onPress={() => (navigation as any).navigate('DoctorAppointmentDetail', {
                    appointmentId: appointment.id,
                  })}
                  activeOpacity={0.7}
                >
                  <View style={styles.appointmentContent}>
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
                    <View style={styles.appointmentInfo}>
                      <View style={styles.appointmentHeader}>
                        <Text style={styles.appointmentPatient}>
                          {appointment.patient?.full_name || 'Bệnh nhân'}
                        </Text>
                        <Text style={styles.appointmentTime}>{appointment.time_slot}</Text>
                      </View>
                      <Text style={styles.studentLabel}>Sinh viên</Text>
                      {appointment.reason && (
                        <View style={styles.tagsContainer}>
                          <View
                            style={[styles.tag, { backgroundColor: Colors.primary }]}
                          >
                            <Text style={styles.tagText}>{appointment.reason}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.arrowButton}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>Không có cuộc hẹn nào</Text>
              <Text style={styles.emptyStateSubtext}>
                Chọn ngày khác để xem các cuộc hẹn
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar items={navItems} activeColor={Colors.success} />
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
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderColor: Colors.success,
    borderRadius: (width - 32) / 14,
  },
  selectedDay: {
    backgroundColor: Colors.success,
    borderRadius: (width - 32) / 14,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  todayText: {
    color: Colors.success,
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
    textTransform: 'capitalize',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  appointmentPatient: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  appointmentTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  studentLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.background,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  upcomingSection: {
    padding: 16,
    paddingBottom: 8,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  upcomingCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  upcomingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDateContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  upcomingMonth: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  upcomingTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default DoctorCalendarScreen;
