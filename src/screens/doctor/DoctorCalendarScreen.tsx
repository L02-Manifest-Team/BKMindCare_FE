import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const { width } = Dimensions.get('window');

interface Appointment {
  id: string;
  time: string;
  patient: string;
  type: 'offline' | 'online';
  duration: string;
  tags?: string[];
  date: Date;
}

const DoctorCalendarScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
  ];

  // Mock appointments with dates and tags
  const allAppointments: Appointment[] = [
    { 
      id: '1', 
      time: '09:00', 
      patient: 'Truc Quynh', 
      type: 'offline', 
      duration: '30 minutes',
      tags: ['Anxiety'],
      date: new Date(),
    },
    { 
      id: '2', 
      time: '14:00', 
      patient: 'Thuy Vi', 
      type: 'offline', 
      duration: '30 minutes',
      tags: ['Pressure'],
      date: new Date(),
    },
    { 
      id: '3', 
      time: '16:00', 
      patient: 'Truc Quynh', 
      type: 'online', 
      duration: '45 minutes',
      tags: ['Stress', 'Relationship Issues Chat'],
      date: new Date(),
    },
    {
      id: '4',
      time: '10:00',
      patient: 'Anonymous',
      type: 'online',
      duration: '30 minutes',
      tags: ['Stress', 'Relationship Issues Chat'],
      date: new Date(Date.now() + 86400000), // Tomorrow
    },
  ];

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
    return allAppointments.some((apt) => {
      const aptDate = apt.date;
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getFullYear() === date.getFullYear();
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return allAppointments.filter((apt) => {
      const aptDate = apt.date;
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === aptDate.getMonth() &&
             aptDate.getFullYear() === aptDate.getFullYear();
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
  const filteredAppointments = selectedAppointments.filter((apt) =>
    apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            placeholder="Search appointments..."
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
          
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment, index) => (
              <TouchableOpacity
                key={appointment.id}
                style={[
                  styles.appointmentCard,
                  { backgroundColor: getCardBackgroundColor(index) }
                ]}
                onPress={() => navigation.navigate('DoctorAppointmentDetail' as never, {
                  appointmentId: appointment.id,
                  patientName: appointment.patient,
                  date: appointment.date.toISOString().split('T')[0],
                  time: appointment.time,
                  type: appointment.type,
                  location: appointment.type === 'offline' ? 'BK.B6' : undefined,
                  duration: appointment.duration,
                  tags: appointment.tags,
                } as any)}
                activeOpacity={0.7}
              >
                <View style={styles.appointmentContent}>
                  <View style={styles.patientAvatar}>
                    {appointment.patient === 'Anonymous' ? (
                      <Ionicons name="person" size={24} color={Colors.textSecondary} />
                    ) : (
                      <Ionicons name="person" size={24} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.appointmentHeader}>
                      <Text style={styles.appointmentPatient}>
                        {appointment.patient === 'Anonymous' ? 'anonymous' : appointment.patient}
                      </Text>
                      <Text style={styles.appointmentTime}>{appointment.time}</Text>
                    </View>
                    {appointment.patient !== 'Anonymous' && (
                      <Text style={styles.studentLabel}>student</Text>
                    )}
                    <View style={styles.tagsContainer}>
                      {appointment.tags?.map((tag, tagIndex) => (
                        <View
                          key={tagIndex}
                          style={[styles.tag, { backgroundColor: getTagColor(tag) }]}
                        >
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.arrowButton}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                </TouchableOpacity>
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
});

export default DoctorCalendarScreen;
