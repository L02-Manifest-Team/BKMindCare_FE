import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useAuth } from '../../context/AuthContext';
import { appointmentService, AppointmentWithRelations } from '../../services/appointmentService';
import { chatService } from '../../services/chatService';
import { useNotifications } from '../../context/NotificationContext';

const DoctorDashboard = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithRelations[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalMessages: 0,
    rating: 5.0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Load upcoming appointments (from today onwards)
  const loadUpcomingAppointments = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentService.getAppointments({
        start_date: today,
        // No end_date to get future appointments
        limit: 10,
      });
      
      // Filter for future appointments (including today) and sort by date and time
      const upcomingApts = response.data
        .filter(apt => apt.appointment_date >= today && apt.status !== 'CANCELLED')
        .sort((a, b) => {
          // Sort by date first
          if (a.appointment_date !== b.appointment_date) {
            return a.appointment_date.localeCompare(b.appointment_date);
          }
          // Then by time
          const timeA = a.time_slot.split(':').map(Number);
          const timeB = b.time_slot.split(':').map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        })
        .slice(0, 3); // Limit to 3 items for dashboard
      
      setUpcomingAppointments(upcomingApts);
    } catch (error) {
      console.error('Error loading upcoming appointments:', error);
    }
  }, []);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    try {
      // Load appointments to count
      const appointmentsResponse = await appointmentService.getAppointments({ limit: 100 });
      const allAppointments = appointmentsResponse.data;
      
      // Count unique patients
      const uniquePatients = new Set(allAppointments.map(apt => apt.patient_id));
      
      // Count pending appointments
      const pending = allAppointments.filter(apt => apt.status === 'PENDING');
      setPendingCount(pending.length);
      
      // Load chats to count messages
      let totalMessages = 0;
      try {
        const chats = await chatService.getChats();
        totalMessages = chats.length;
      } catch (error) {
        console.error('Error loading chats:', error);
      }

      setStatistics({
        totalPatients: uniquePatients.size,
        totalAppointments: allAppointments.length,
        totalMessages,
        rating: 5.0, // Default rating as it's not in UserProfile
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }, [user]);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUpcomingAppointments(),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadUpcomingAppointments, loadStatistics]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatTime = (timeSlot: string) => {
    return timeSlot;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getAppointmentType = (notes: string | null) => {
    if (!notes) return 'Chat ẩn danh';
    if (notes.includes('Cơ sở 1') || notes.includes('Cơ sở 2')) {
      return 'Trực tiếp';
    }
    if (notes.toLowerCase().includes('anonymous chat')) {
      return 'Chat ẩn danh';
    }
    return 'Chat ẩn danh';
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.full_name ? user.full_name.split(' ')[user.full_name.split(' ').length - 1] : 'Bác sĩ'}!
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('DoctorNotification' as never)}
              style={styles.notificationButton}
            >
              <Ionicons name="notifications" size={28} color={Colors.text} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Doctor Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            onPress={() => navigation.navigate('DoctorProfile' as never)}
            style={styles.doctorAvatar}
            activeOpacity={0.7}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={Colors.primary} />
            )}
          </TouchableOpacity>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{user?.full_name || 'Bác sĩ'}</Text>
            <Text style={styles.doctorSpecialty}>
              {user?.specialization || 'Psychologist'}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons 
                  key={i} 
                  name={i <= Math.round(statistics.rating) ? "star" : "star-outline"} 
                  size={16} 
                  color={Colors.warning} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.purpleLight }]}
            onPress={() => navigation.navigate('PatientStats' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={32} color={Colors.purple} />
            <Text style={styles.metricNumber}>{statistics.totalPatients}</Text>
            <Text style={styles.metricLabel}>Bệnh nhân</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.greenLight }]}
            onPress={() => navigation.navigate('DoctorCalendar' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={32} color={Colors.success} />
            <Text style={styles.metricNumber}>{statistics.totalAppointments}</Text>
            <Text style={styles.metricLabel}>Cuộc hẹn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.purpleLight }]}
            onPress={() => navigation.navigate('DoctorChatList' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles" size={32} color={Colors.purple} />
            <Text style={styles.metricNumber}>{statistics.totalMessages}</Text>
            <Text style={styles.metricLabel}>Tin nhắn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.blueLight }]}
            onPress={() => navigation.navigate('Rating' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={32} color={Colors.warning} />
            <Text style={styles.metricNumber}>{statistics.rating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>Đánh giá</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Appointments Review */}
        {pendingCount > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.pendingCard}
              onPress={() => navigation.navigate('DoctorAppointmentReview' as never)}
              activeOpacity={0.7}
            >
              <View style={styles.pendingIconContainer}>
                <Ionicons name="time-outline" size={32} color={Colors.warning} />
              </View>
              <View style={styles.pendingContent}>
                <Text style={styles.pendingTitle}>Có {pendingCount} lịch hẹn cần xét duyệt</Text>
                <Text style={styles.pendingSubtitle}>Nhấn để xem và xét duyệt</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cuộc hẹn sắp tới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorCalendar' as never)}>
              <Text style={styles.viewAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => {
              const appointmentType = getAppointmentType(appointment.notes);
              const location = getAppointmentLocation(appointment.notes);
              return (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => (navigation as any).navigate('DoctorAppointmentDetail', {
                    appointmentId: appointment.id,
                  })}
                >
                  <View style={styles.appointmentTimeContainer}>
                    <Text style={styles.appointmentDate}>{formatDate(appointment.appointment_date)}</Text>
                    <Text style={styles.appointmentTime}>{formatTime(appointment.time_slot)}</Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentPatient}>
                      {appointment.patient?.full_name || 'Bệnh nhân'}
                    </Text>
                    <Text style={styles.appointmentDetail}>
                      {appointmentType === 'Trực tiếp' ? 'Trực tiếp' : 'Chat ẩn danh'}, {location || 'Online'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có cuộc hẹn sắp tới</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar
        items={[
          { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
          { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
          { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
          { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
        ]}
        activeColor={Colors.success}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 72,
    height: 72,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 24,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  metricsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pendingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pendingContent: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  pendingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    marginRight: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  appointmentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default DoctorDashboard;
