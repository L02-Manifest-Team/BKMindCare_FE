import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useAuth } from '../../context/AuthContext';

const DoctorProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, refreshUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: 'DoctorDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'DoctorChatList' },
    { name: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar', route: 'DoctorCalendar' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: 'DoctorProfile' },
  ];

  // Fetch user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      await refreshUser();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Reset navigation stack to prevent going back
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      title: 'Chỉnh sửa hồ sơ',
      icon: 'person-outline',
      onPress: () => navigation.navigate('DoctorEditProfile' as never),
    },
    {
      id: '2',
      title: 'Lịch sử hẹn',
      icon: 'calendar-outline',
      onPress: () => navigation.navigate('DoctorAppointmentHistory' as never),
    },
    {
      id: '3',
      title: 'Cài đặt',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('DoctorSettings' as never),
    },
    {
      id: '4',
      title: 'Trợ giúp & Hỗ trợ',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('DoctorHelpSupport' as never),
    },
    {
      id: '5',
      title: 'Giới thiệu',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('DoctorAbout' as never),
    },
    {
      id: '6',
      title: 'Đăng xuất',
      icon: 'log-out-outline',
      onPress: handleLogout,
      color: Colors.error,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <>
              {/* Profile Section */}
              <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    {user?.avatar ? (
                      <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="person" size={48} color={Colors.primary} />
                    )}
                  </View>
                </View>
                <Text style={styles.userName}>{user?.full_name || 'Doctor'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                <Text style={styles.userRole}>
                  {user?.specialization || 'Psychologist'} • {user?.phone_number || ''}
                </Text>
                {user?.bio && (
                  <Text style={styles.userBio}>{user.bio}</Text>
                )}
              </View>

              {/* Stats Section */}
              <View style={styles.statsSection}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>-</Text>
                  <Text style={styles.statLabel}>Bệnh nhân</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>-</Text>
                  <Text style={styles.statLabel}>Lịch hẹn</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>-</Text>
                  <Text style={styles.statLabel}>Đánh giá</Text>
                </View>
              </View>

              {/* Menu Items */}
              <View style={styles.menuSection}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={item.color || Colors.text}
                      />
                      <Text
                        style={[
                          styles.menuItemText,
                          item.color && { color: item.color },
                        ]}
                      >
                        {item.title}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  menuSection: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default DoctorProfileScreen;

