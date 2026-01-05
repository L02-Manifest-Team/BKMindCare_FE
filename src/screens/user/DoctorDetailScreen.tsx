import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { doctorService, DoctorProfile } from '../../services/doctorService';
import { chatService } from '../../services/chatService';

const { width } = Dimensions.get('window');

type TabType = 'book' | 'about' | 'reviews';

interface Review {
  id: string;
  userName: string;
  date: string;
  rating: number;
  text: string;
  verified: boolean;
  avatar?: string;
}

const DoctorDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const doctorId = (route.params as any)?.doctorId;
  
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video-call'>('in-person');

  // Fetch doctor data
  const loadDoctor = useCallback(async () => {
    if (!doctorId) return;
    try {
      setLoading(true);
      const data = await doctorService.getDoctorById(doctorId);
      setDoctor({
        ...data,
        specialization: data.doctor_profile?.specialization || data.specialization,
        bio: data.doctor_profile?.bio || data.bio,
        rating: data.doctor_profile?.rating || data.rating || 0,
      });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin bác sĩ');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [doctorId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadDoctor();
    }, [loadDoctor])
  );

  const handleStartChat = async () => {
    if (!doctor) return;
    try {
      const chat = await chatService.createChat(doctor.id);
      (navigation as any).navigate('Chat', {
        chatId: chat.id,
        doctorId: doctor.id,
        doctorName: doctor.full_name,
      });
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo chat');
    }
  };

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Kalli',
      date: '20 Jul',
      rating: 5,
      text: 'I had an amazing experience with this service. The care and attention to detail was exceptional. Highly recommend!',
      verified: true,
    },
    {
      id: '2',
      userName: 'Kalli',
      date: '22 Jul',
      rating: 5,
      text: 'Outstanding service! The team was professional and caring. I felt very comfortable throughout the entire process.',
      verified: true,
    },
    {
      id: '3',
      userName: 'Sarah',
      date: '15 Jul',
      rating: 5,
      text: 'Great experience overall. The doctor was very understanding and provided excellent care.',
      verified: false,
    },
  ];

  // Mock about text - will use doctor.bio if available
  const aboutText = doctor?.bio || `Hi I'm a mental health professional!`;

  // Generate calendar dates for current month
  const getCalendarDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dates = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      dates.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  const calendarDates = getCalendarDates();
  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00', '18:00'];

  const handleBookAppointment = () => {
    if (!doctor || !selectedDate || !selectedTime) return;
    
    const formattedDate = selectedDate.toISOString().split('T')[0];
    (navigation as any).navigate('Appointment', {
      doctorId: doctor.id,
      date: formattedDate,
      time: selectedTime,
      type: appointmentType,
    });
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.headerButton}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? Colors.error : Colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 16, color: Colors.textSecondary }}>Đang tải...</Text>
          </View>
        ) : !doctor ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary }}>Không tìm thấy thông tin</Text>
          </View>
        ) : (
          <>
        {/* Doctor Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileInfo}>
            <Text style={styles.doctorName}>{doctor.full_name}</Text>
            <Text style={styles.specialization}>{doctor.specialization || 'Chuyên gia tâm lý'}</Text>
            <View style={styles.ratingBar}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color={Colors.warning} />
                <Text style={styles.rating}>{doctor.rating?.toFixed(1) || '0.0'}</Text>
              </View>
              <Text style={styles.doctorId}>ID: {String(doctor.id).padStart(7, '0')}</Text>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: doctor.avatar || 'https://i.pravatar.cc/150?img=1' }}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'book' && styles.activeTab]}
            onPress={() => setActiveTab('book')}
          >
            <Text style={[styles.tabText, activeTab === 'book' && styles.activeTabText]}>
              Book
            </Text>
            {activeTab === 'book' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              About
            </Text>
            {activeTab === 'about' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
            {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'book' && (
            <View>
              {/* Calendar */}
              <View style={styles.calendarSection}>
                <View style={styles.calendarHeader}>
                  <TouchableOpacity>
                    <Ionicons name="chevron-back" size={20} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.monthYear}>{formatMonthYear(new Date())}</Text>
                  <TouchableOpacity>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.weekDays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekDay}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {calendarDates.map((date, index) => {
                    if (!date) {
                      return <View key={`empty-${index}`} style={styles.calendarDay} />;
                    }
                    const isSelectedDate = isSelected(date);
                    const isTodayDate = isToday(date);
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
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Time Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select time</Text>
                <View style={styles.timeGrid}>
                  {timeSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.selectedTimeSlot,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === time && styles.selectedTimeText,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Duration</Text>
                <Text style={styles.durationText}>1 hour consultation</Text>
              </View>

              {/* Type of Appointment */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Type of appointment</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => setAppointmentType('in-person')}
                  >
                    <View style={styles.radioButton}>
                      {appointmentType === 'in-person' && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.typeText}>In-person</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => setAppointmentType('video-call')}
                  >
                    <View style={styles.radioButton}>
                      {appointmentType === 'video-call' && <View style={styles.radioSelected} />}
                    </View>
                    <Text style={styles.typeText}>Video call</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Location */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <Text style={styles.locationText}>BK.B6</Text>
              </View>
            </View>
          )}

          {activeTab === 'about' && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutText}>{aboutText}</Text>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsSection}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewLeft}>
                      <View style={styles.reviewAvatar}>
                        <Ionicons name="person" size={20} color={Colors.primary} />
                      </View>
                      <View style={styles.reviewInfo}>
                        <View style={styles.reviewNameRow}>
                          <Text style={styles.reviewName}>{review.userName}</Text>
                          <Text style={styles.reviewDate}>{review.date}</Text>
                          {review.verified && (
                            <View style={styles.verifiedBadge}>
                              <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={14}
                          color={i < review.rating ? Colors.warning : Colors.border}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewText} numberOfLines={4}>
                    {review.text}
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.readMoreText}>Read More</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {!loading && doctor && (
        <View style={[styles.bookButtonContainer, { paddingBottom: insets.bottom + 16 }]}>
          {activeTab === 'book' ? (
            <TouchableOpacity
              style={[
                styles.bookButton,
                (!selectedDate || !selectedTime) && styles.bookButtonDisabled,
              ]}
              onPress={handleBookAppointment}
              disabled={!selectedDate || !selectedTime}
            >
              <Text style={styles.bookButtonText}>Đặt lịch hẹn</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleStartChat}
            >
              <Ionicons name="chatbubbles" size={20} color={Colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.bookButtonText}>Nhắn tin với bác sĩ</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.primaryLight,
  },
  headerButton: {
    padding: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 20,
  },
  profileInfo: {
    flex: 1,
    marginRight: 16,
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  doctorId: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.text,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.teal,
  },
  tabContent: {
    backgroundColor: Colors.background,
    padding: 16,
    minHeight: 400,
  },
  calendarSection: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: Colors.teal,
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: Colors.teal,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: Colors.text,
  },
  todayText: {
    color: Colors.teal,
    fontWeight: '600',
  },
  selectedDayText: {
    color: Colors.background,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedTimeSlot: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: Colors.background,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  typeContainer: {
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.teal,
  },
  typeText: {
    fontSize: 14,
    color: Colors.text,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  aboutSection: {
    paddingVertical: 8,
  },
  aboutText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  reviewsSection: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    backgroundColor: Colors.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.purple,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.purple,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.teal,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});

export default DoctorDetailScreen;

