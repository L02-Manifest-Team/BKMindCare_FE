import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { moodService, MoodType, MoodEntry } from '../../services/moodService';
import { authService } from '../../services/authService';
import BottomNavigationBar from '../../components/BottomNavigationBar';
import { useNotifications } from '../../context/NotificationContext';

interface StreakData {
  streakCount: number;
  weeklyStatus: { day: string; checked: boolean; mood?: MoodType }[];
  userName: string;
}

// Mood info mapping with images
const moodImages = {
  HAPPY: require('../../../assets/Happy.png'),
  EXCITED: require('../../../assets/Wonderful.png'),
  CALM: require('../../../assets/Shy.png'),
  SAD: require('../../../assets/Sad.png'),
  ANXIOUS: require('../../../assets/Nervous.png'),
  STRESSED: require('../../../assets/Awkward.png'),
  ANGRY: require('../../../assets/Nervous.png'),
  TIRED: require('../../../assets/Sad.png'),
};

const moodInfo: Record<MoodType, { emoji: string; label: string; color: string; isNegative: boolean }> = {
  HAPPY: { emoji: '😊', label: 'Vui vẻ', color: '#4CAF50', isNegative: false },
  EXCITED: { emoji: '🤩', label: 'Hào hứng', color: '#FF9800', isNegative: false },
  CALM: { emoji: '😌', label: 'Bình tĩnh', color: '#2196F3', isNegative: false },
  SAD: { emoji: '😢', label: 'Buồn', color: '#9E9E9E', isNegative: true },
  ANXIOUS: { emoji: '😰', label: 'Lo lắng', color: '#FF5722', isNegative: true },
  STRESSED: { emoji: '😫', label: 'Căng thẳng', color: '#E91E63', isNegative: true },
  ANGRY: { emoji: '😠', label: 'Tức giận', color: '#F44336', isNegative: true },
  TIRED: { emoji: '😴', label: 'Mệt mỏi', color: '#795548', isNegative: true },
};

const UserDashboard = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Bạn');

  // Refresh data every time screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Also refresh when coming back from MoodCheckIn
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const user = await authService.getCurrentUser();
        setUserName(user.full_name || 'Bạn');
      } catch (e) {
        console.log('Could not fetch user');
      }
      
      const streak = await moodService.getStreakData();
      setStreakData(streak);
      
      const hasCheckedIn = await moodService.hasTodayCheckIn();
      if (hasCheckedIn) {
        const latestMood = await moodService.getLatestMood();
        setTodayMood(latestMood);
      } else {
        // Clear todayMood if not checked in
        setTodayMood(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { name: 'Trang chủ', icon: 'home-outline', activeIcon: 'home', route: 'UserDashboard' },
    { name: 'Chat', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', route: 'ChatList' },
    { name: 'Lịch hẹn', icon: 'calendar-outline', activeIcon: 'calendar', route: 'Calendar' },
    { name: 'Cá nhân', icon: 'person-outline', activeIcon: 'person', route: 'Profile' },
  ];

  const currentMoodInfo = todayMood ? moodInfo[todayMood.mood as MoodType] : null;
  const isNegativeMood = currentMoodInfo?.isNegative || false;
  const currentMoodImage = todayMood ? moodImages[todayMood.mood as MoodType] : null;

  // Get gradient colors based on mood
  const getStreakGradient = (): readonly [string, string, string] => {
    if (!todayMood) return ['#26A69A', '#4DB6AC', '#80CBC4'] as const;
    if (isNegativeMood) return ['#7986CB', '#5C6BC0', '#9FA8DA'] as const;
    return ['#26A69A', '#4DB6AC', '#80CBC4'] as const;
  };

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
              <Text style={styles.welcomeText}>Xin chào, {userName}!</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('StudentNotification' as never)}
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
              <TouchableOpacity
                onPress={() => navigation.navigate('Profile' as never)}
                style={styles.profileIcon}
              >
                <Ionicons name="person" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Combined Streak + Mood Card */}
        <View style={styles.streakSection}>
          <TouchableOpacity 
            onPress={() => navigation.navigate((todayMood ? 'MoodHistory' : 'MoodCheckIn') as never)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={getStreakGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.streakCard}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  {/* Streak Section - Full Width */}
                  <View style={styles.streakFullSection}>
                    <View style={styles.streakInfoFull}>
                      <View style={styles.streakCountContainer}>
                        <Ionicons name="flame" size={28} color="#fff" />
                        <Text style={styles.streakCount}>
                          {streakData?.streakCount || 0}
                        </Text>
                        <Text style={styles.streakLabelInline}>ngày liên tiếp</Text>
                      </View>
                    </View>
                    
                    {/* Today's Mood - Large Image */}
                    <View style={styles.todayMoodImageContainer}>
                      {todayMood && currentMoodImage ? (
                        <>
                          <View style={styles.moodImageWrapper}>
                            <Image 
                              source={currentMoodImage} 
                              style={styles.moodImage}
                              resizeMode="contain"
                            />
                          </View>
                          <Text style={styles.moodImageLabel}>{currentMoodInfo?.label}</Text>
                        </>
                      ) : (
                        <>
                          <View style={styles.moodImageWrapper}>
                            <Text style={styles.moodEmoji}>🤔</Text>
                          </View>
                          <Text style={styles.moodImageLabel}>Chưa ghi nhận</Text>
                        </>
                      )}
                    </View>
                  </View>
                  
                  {/* Weekly Check-in Status with Mood Emoji - Full Width */}
                  <View style={styles.weeklyContainerFull}>
                    {streakData?.weeklyStatus.map((day, index) => {
                      const dayMoodInfo = day.mood ? moodInfo[day.mood] : null;
                      return (
                        <View key={index} style={styles.dayColumnFull}>
                          <Text style={styles.dayLabel}>{day.day}</Text>
                          <View style={[
                            styles.dayCheckFull,
                            day.checked ? styles.dayChecked : styles.dayUnchecked
                          ]}>
                            {day.checked && dayMoodInfo ? (
                              <Text style={{ fontSize: 16 }}>{dayMoodInfo.emoji}</Text>
                            ) : day.checked ? (
                              <Ionicons name="checkmark" size={16} color="#fff" />
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  
                  {/* Encouraging Message */}
                  <Text style={styles.streakHint}>
                    {todayMood 
                      ? (isNegativeMood ? '💜 Bạn không đơn độc, hãy chia sẻ nhé!' : '✨ Tuyệt vời! Tiếp tục giữ năng lượng này!')
                      : '👆 Nhấn để ghi nhận cảm xúc hôm nay'}
                  </Text>
                  
                  {/* View Today's Mood Button */}
                  {todayMood && (
                    <TouchableOpacity
                      style={styles.viewMoodButton}
                      onPress={() => navigation.navigate('MoodCheckIn' as never)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                      <Text style={styles.viewMoodText}>Xem lại cảm xúc hôm nay</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Negative Mood Support Section */}
        {!loading && isNegativeMood && (
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>💛 Chúng mình ở đây vì bạn</Text>
            <View style={styles.supportActions}>
              <TouchableOpacity
                style={styles.supportCard}
                onPress={() => navigation.navigate('Journal' as never)}
              >
                <LinearGradient
                  colors={['#FFF8E1', '#FFECB3']}
                  style={styles.supportCardGradient}
                >
                  <Ionicons name="book" size={28} color="#FFA000" />
                  <Text style={styles.supportCardTitle}>Nhật ký</Text>
                  <Text style={styles.supportCardDesc}>Viết ra sẽ nhẹ lòng hơn</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.supportCard}
                onPress={() => navigation.navigate('ChatList' as never)}
              >
                <LinearGradient
                  colors={['#E8F5E9', '#C8E6C9']}
                  style={styles.supportCardGradient}
                >
                  <Ionicons name="chatbubble-ellipses" size={28} color="#43A047" />
                  <Text style={styles.supportCardTitle}>Tâm sự</Text>
                  <Text style={styles.supportCardDesc}>Chat với chuyên gia</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.supportCard}
                onPress={() => navigation.navigate('MentalHealthTest' as never)}
              >
                <LinearGradient
                  colors={['#E3F2FD', '#BBDEFB']}
                  style={styles.supportCardGradient}
                >
                  <Ionicons name="clipboard" size={28} color="#1976D2" />
                  <Text style={styles.supportCardTitle}>Bài test</Text>
                  <Text style={styles.supportCardDesc}>Hiểu bản thân hơn</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Journal' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="book" size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionText}>Nhật ký</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('MoodHistory' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="bar-chart" size={24} color="#4A90E2" />
              </View>
              <Text style={styles.quickActionText}>Lịch sử cảm xúc</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('ChatList' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="chatbubbles" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionText}>Chat tư vấn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Appointment' as never)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="calendar" size={24} color="#E91E63" />
              </View>
              <Text style={styles.quickActionText}>Đặt lịch hẹn</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          {[
            { name: 'Đặt lịch khám', route: 'Appointment', icon: 'calendar-outline' },
            { name: 'Kiểm tra sức khỏe tâm thần', route: 'MentalHealthTest', icon: 'clipboard-outline' },
            { name: 'Danh sách bác sĩ', route: 'AllDoctors', icon: 'people-outline' },
            { name: 'Câu hỏi thường gặp', route: 'FAQ', icon: 'help-circle-outline' },
          ].map((service) => (
            <TouchableOpacity
              key={service.name}
              style={styles.serviceItem}
              onPress={() => navigation.navigate(service.route as never)}
            >
              <View style={styles.serviceLeft}>
                <Ionicons name={service.icon as any} size={22} color={Colors.primary} />
                <Text style={styles.serviceText}>{service.name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    width: 60,
    height: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  // Streak Card
  streakSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakFullSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakInfoFull: {
    flex: 1,
    alignItems: 'flex-start',
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  streakCount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  streakLabelInline: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.95)',
    marginLeft: 8,
    fontWeight: '600',
  },
  todayMoodBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  todayMoodImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodImageWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    padding: 6,
  },
  moodImage: {
    width: 65,
    height: 65,
  },
  moodImageLabel: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  moodEmoji: {
    fontSize: 45,
  },
  moodLabel: {
    fontSize: 13,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
  },
  weeklyContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  weeklyContainerFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 8,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayColumnFull: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  dayCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCheckFull: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayChecked: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dayUnchecked: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  streakHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  viewMoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  viewMoodText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  // Support Section
  supportSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  supportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportCard: {
    width: '31%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportCardGradient: {
    padding: 14,
    alignItems: 'center',
    minHeight: 110,
  },
  supportCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  supportCardDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  // Section
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  // Service Items
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceText: {
    fontSize: 16,
    color: Colors.text,
  },
});

export default UserDashboard;
