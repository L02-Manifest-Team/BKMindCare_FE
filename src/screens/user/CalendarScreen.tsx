import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { mockAppointments } from '../../constants/data';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const { width } = Dimensions.get('window');

const CalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const formatMonthYear = (date: Date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
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
    // Check if there's an appointment on this date
    return mockAppointments.some((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return mockAppointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
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
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          
          {selectedAppointments.length > 0 ? (
            selectedAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                style={styles.appointmentCard}
                onPress={() => navigation.navigate('AppointmentHistory' as never)}
              >
                <View style={styles.appointmentTimeContainer}>
                  <Ionicons name="time-outline" size={20} color={Colors.primary} />
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
                  <Text style={styles.appointmentType}>
                    {appointment.type === 'in-person' ? 'In-person' : 'Video call'}
                  </Text>
                  <View style={styles.appointmentStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: appointment.status === 'confirmed' ? Colors.success : Colors.warning }
                    ]} />
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No appointments scheduled</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap on a date with an appointment to view details
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Appointment' as never)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Book New Appointment</Text>
              <Text style={styles.quickActionSubtitle}>Schedule a consultation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AppointmentHistory' as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.purpleLight }]}>
              <Ionicons name="list" size={24} color={Colors.purple} />
            </View>
            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>View All Appointments</Text>
              <Text style={styles.quickActionSubtitle}>See your appointment history</Text>
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

