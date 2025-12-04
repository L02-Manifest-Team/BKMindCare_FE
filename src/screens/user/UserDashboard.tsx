import React from 'react';
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
import { mockDoctors, mockAppointments } from '../../constants/data';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const UserDashboard = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const upcomingAppointment = mockAppointments[0];

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
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
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back, Candy</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={() => navigation.navigate('StudentNotification' as never)}>
                <Ionicons name="notifications" size={28} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile' as never)}
                style={styles.profileIcon}
              >
                <Ionicons name="person" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Question Section */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>How's your mental state at the moment?</Text>
        </View>

        {/* Mood Check-in Button */}
        <View style={styles.moodSection}>
          <TouchableOpacity
            style={styles.moodCheckInButton}
            onPress={() => navigation.navigate('MoodCheckIn' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={24} color={Colors.primary} />
            <Text style={styles.moodCheckInText}>Mood Check-in</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Anonymous Chat Button */}
        <View style={styles.moodSection}>
          <TouchableOpacity
            style={styles.anonymousChatButton}
            onPress={() => (navigation as any).navigate('ChatList')}
            activeOpacity={0.7}
          >
            <View style={styles.anonymousChatIcon}>
              <Ionicons name="lock-closed" size={24} color={Colors.primary} />
            </View>
            <View style={styles.anonymousChatInfo}>
              <Text style={styles.anonymousChatTitle}>Chat ẩn danh</Text>
              <Text style={styles.anonymousChatSubtitle}>Trò chuyện với chuyên gia một cách ẩn danh</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming appointments</Text>
          {upcomingAppointment && (
            <TouchableOpacity
              style={styles.appointmentCard}
              onPress={() => (navigation as any).navigate('AppointmentDetail', { appointmentId: upcomingAppointment.id })}
            >
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentLeft}>
                  <Text style={styles.appointmentDoctor}>{upcomingAppointment.doctorName}</Text>
                  <Text style={styles.appointmentDate}>19/11/2025</Text>
                  <Text style={styles.appointmentDetail}>Session detail chat</Text>
                  <Text style={styles.appointmentDuration}>Duration: 60mins</Text>
                  <View style={styles.appointmentTime}>
                    <Text style={styles.appointmentTimeText}>{upcomingAppointment.time}</Text>
                    <View style={styles.greenDot} />
                  </View>
                </View>
                <View style={styles.appointmentIcon}>
                  <Image 
                    source={require('../../../assets/carddetails(1).png')} 
                    style={styles.appointmentImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Available Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDoctors' as never)}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.doctorsGrid}>
            {mockDoctors.slice(0, 4).map((doctor, index) => {
              // Map doctors to card images
              const cardImages = [
                require('../../../assets/carddetails(1).png'),
                require('../../../assets/carddetails(3).png'),
                require('../../../assets/carddetails(4).png'),
                require('../../../assets/carddetails(2).png'), // Fallback for 4th doctor
              ];
              
              return (
                <TouchableOpacity
                  key={doctor.id}
                  style={styles.doctorCard}
                  onPress={() => (navigation as any).navigate('DoctorDetail', { doctorId: doctor.id })}
                >
                  <Image 
                    source={cardImages[index]} 
                    style={styles.doctorCardImage}
                    resizeMode="contain"
                  />
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={Colors.warning} />
                    <Text style={styles.rating}>{doctor.rating}</Text>
                  </View>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
                  <TouchableOpacity style={styles.doctorButton}>
                    <Ionicons name="chevron-up" size={16} color={Colors.teal} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {[
            { name: 'Appointments', route: 'Appointment' },
            { name: 'Mental Health Test', route: 'MentalHealthTest' },
            { name: 'FAQ', route: 'FAQ' },
            { name: 'Support chat', route: 'Chat' },
          ].map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.serviceItem}
              onPress={() => navigation.navigate(service.route as never)}
            >
              <Text style={styles.serviceText}>{service.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  questionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  moodSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  moodCheckInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  moodCheckInText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
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
  },
  anonymousChatInfo: {
    flex: 1,
    marginLeft: 12,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appointmentLeft: {
    flex: 1,
  },
  appointmentDoctor: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appointmentDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  appointmentDuration: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTimeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginRight: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  appointmentIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentImage: {
    width: 80,
    height: 80,
  },
  doctorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  doctorCard: {
    width: '48%',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  doctorCardImage: {
    width: '100%',
    height: 120,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: Colors.text,
    marginLeft: 4,
    fontWeight: '600',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  doctorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceText: {
    fontSize: 16,
    color: Colors.text,
  },
});

export default UserDashboard;
