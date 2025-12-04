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
import BottomNavigationBar from '../../components/BottomNavigationBar';

const AboutScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>BKMindCare</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About BKMindCare</Text>
          <Text style={styles.sectionText}>
            BKMindCare is a comprehensive mental health support platform designed specifically for students at Ho Chi Minh City University of Technology (HCMUT). Our mission is to provide accessible, professional, and confidential mental health services to help students navigate their academic and personal challenges.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Patient Management & Statistics</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Appointment Scheduling & Management</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Anonymous Chat Support</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Patient Emotional Trends Analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.featureText}>Review & Rating System</Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>support@bkmindcare.edu.vn</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>+84 123 456 789</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.contactText}>HCMUT Campus, Ho Chi Minh City</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2024 BKMindCare. All rights reserved.</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  copyrightSection: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default AboutScreen;

