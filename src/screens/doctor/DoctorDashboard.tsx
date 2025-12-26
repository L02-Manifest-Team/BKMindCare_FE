import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { EmotionalTendenciesChart } from '../../components/EmotionalTendenciesChart';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const DoctorDashboard = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const chartData = [
    { label: 'Happy', value: 45, color: Colors.yellow },
    { label: 'Calm', value: 30, color: Colors.blue },
    { label: 'Anxious', value: 15, color: Colors.orange },
    { label: 'Stressed', value: 8, color: Colors.purple },
    { label: 'Sad', value: 2, color: Colors.error },
  ];

  const todayAppointments = [
    { 
      id: '1', 
      time: '09:00', 
      patient: 'Truc Quynh', 
      type: 'in-person', 
      duration: '30 minutes',
      date: new Date().toISOString().split('T')[0],
      tags: ['Anxiety'],
    },
    { 
      id: '2', 
      time: '14:00', 
      patient: 'Thuy Vi', 
      type: 'in-person', 
      duration: '30 minutes',
      date: new Date().toISOString().split('T')[0],
      tags: ['Pressure'],
    },
  ];

  const reviews = [
    {
      id: '1',
      patient: 'Truc Quynh',
      rating: 5,
      comment: 'He is very dedicated and understands my problem. After the consultation sessions, I feel much more comfortable.',
    },
    {
      id: '2',
      patient: 'Thuy Vi',
      rating: 5,
      comment: "The doctor's methods are very useful. I have applied them and found them to be effective!",
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
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
              <Text style={styles.greeting}>{getGreeting()}, Doctor!</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notification' as never)}>
              <Ionicons name="notifications" size={28} color={Colors.text} />
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
            <Ionicons name="person" size={40} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Hoang Le Hai Thanh</Text>
            <Text style={styles.doctorSpecialty}>Psychologist</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={16} color={Colors.warning} />
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
            <Text style={styles.metricNumber}>248</Text>
            <Text style={styles.metricLabel}>patient</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.greenLight }]}
            onPress={() => navigation.navigate('DoctorCalendar' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={32} color={Colors.success} />
            <Text style={styles.metricNumber}>32</Text>
            <Text style={styles.metricLabel}>appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.purpleLight }]}
            onPress={() => navigation.navigate('DoctorChatList' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubbles" size={32} color={Colors.purple} />
            <Text style={styles.metricNumber}>18</Text>
            <Text style={styles.metricLabel}>message</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: Colors.blueLight }]}
            onPress={() => navigation.navigate('Rating' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={32} color={Colors.warning} />
            <Text style={styles.metricNumber}>5.0</Text>
            <Text style={styles.metricLabel}>rating</Text>
          </TouchableOpacity>
        </View>

        {/* Anonymous Chat Button */}
        <View style={styles.anonymousChatSection}>
          <TouchableOpacity
            style={styles.anonymousChatButton}
            onPress={() => (navigation as any).navigate('DoctorChat', {
              chatId: 'anonymous-chat-1',
              doctorId: '1',
              doctorName: 'Hoang Le Hai Thanh',
              doctorAvatar: undefined,
              isAnonymous: true,
            })}
            activeOpacity={0.7}
          >
            <View style={styles.anonymousChatIcon}>
              <Ionicons name="lock-closed" size={24} color={Colors.primary} />
            </View>
            <View style={styles.anonymousChatInfo}>
              <Text style={styles.anonymousChatTitle}>Chat ẩn danh</Text>
              <Text style={styles.anonymousChatSubtitle}>
                Trò chuyện với sinh viên ẩn danh - Thông tin của bạn được hiển thị công khai
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Today's Appointments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's appointment</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DoctorCalendar' as never)}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>
          {todayAppointments.map((appointment) => (
            <TouchableOpacity
              key={appointment.id}
              style={styles.appointmentCard}
              onPress={() => (navigation as any).navigate('DoctorAppointmentDetail', {
                appointmentId: appointment.id,
                patientName: appointment.patient,
                date: appointment.date,
                time: appointment.time,
                type: appointment.type,
                location: appointment.type === 'in-person' ? 'BK.B6' : undefined,
                duration: appointment.duration,
                tags: appointment.tags,
              })}
            >
              <Text style={styles.appointmentTime}>{appointment.time}</Text>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentPatient}>{appointment.patient}</Text>
                <Text style={styles.appointmentDetail}>
                  {appointment.type}, {appointment.duration}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Students' Emotional Tendencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students' emotional tendencies</Text>
          <EmotionalTendenciesChart
            data={chartData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Rating' as never)}>
              <Text style={styles.viewAllText}>View all →</Text>
            </TouchableOpacity>
          </View>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                  <Ionicons name="person" size={20} color={Colors.primary} />
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewPatient}>{review.patient}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ionicons key={i} name="star" size={14} color={Colors.warning} />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
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
  anonymousChatSection: {
    padding: 16,
    paddingTop: 0,
  },
  anonymousChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  anonymousChatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 12,
  },
  anonymousChatInfo: {
    flex: 1,
  },
  anonymousChatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  anonymousChatSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 16,
    minWidth: 60,
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
  reviewCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default DoctorDashboard;
