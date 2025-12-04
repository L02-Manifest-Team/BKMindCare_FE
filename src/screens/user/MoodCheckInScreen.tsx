import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { CustomButton } from '../../components/CustomButton';
import { MoodType } from '../../types';
import { db } from '../../config/firebase';
import { LinearGradient } from 'expo-linear-gradient';


const moods: { type: MoodType; label: string; image: any }[] = [
  { type: 'sad', label: 'Sad', image: require('../../../assets/Sad.png') },
  { type: 'nervous', label: 'Nervous', image: require('../../../assets/Nervous.png') },
  { type: 'awkward', label: 'Awkward', image: require('../../../assets/Awkward.png') },
  { type: 'shy', label: 'Shy', image: require('../../../assets/Shy.png') },
  { type: 'happy', label: 'Happy', image: require('../../../assets/Happy.png') },
  { type: 'wonderful', label: 'Wonderful', image: require('../../../assets/Wonderful.png') },
];

const MoodCheckInScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(
    (route.params as any)?.mood
  );
  const [loading, setLoading] = useState(false);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Vui lòng chọn', 'Hãy chọn cảm xúc của bạn');
      return;
    }

    setLoading(true);
    try {
      // Save mood check-in to Firestore
      const moodCheckIn = {
        userId: 'user1', // TODO: Get from auth context
        mood: selectedMood,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
      };

      await db.collection('moodCheckIns').add(moodCheckIn);

      // Navigate to mood result screen
      navigation.navigate('MoodResult' as never, { mood: selectedMood });
    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert('Lỗi', 'Không thể lưu cảm xúc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
  colors={[
    '#A8E6FF',
    '#C8F0E8',
    '#E8F8F0',
    '#FFE8F5',
    '#FFD4F0'
  ]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.container}
>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mood Check-in</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingBadge}>
            <Ionicons name="cloud-outline" size={16} color={Colors.primary} />
            <Text style={styles.greetingText}>Good Evening</Text>
          </View>
        </View>

        {/* Main Prompt */}
        <View style={styles.promptContainer}>
          <Text style={styles.title}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>
            Take a moment to reflect your emotions and assess your mood today
          </Text>
        </View>

        {/* Mood Grid */}
        <View style={styles.moodGrid}>
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.moodCard,
                selectedMood === mood.type && styles.selectedMoodCard,
              ]}
              onPress={() => setSelectedMood(mood.type)}
              activeOpacity={0.7}
            >
              <Image 
                source={mood.image} 
                style={styles.moodImage}
                resizeMode="contain"
              />
              <Text style={styles.moodLabel}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMood && (
          <View style={styles.selectedMoodInfo}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.selectedMoodText}>
              You selected: {moods.find(m => m.type === selectedMood)?.label}
            </Text>
          </View>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tip:</Text>
          <Text style={styles.tipsText}>
            Daily mood check-ins help you track your mental health and receive timely support from professionals.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Save Mood"
          onPress={handleSaveMood}
          disabled={!selectedMood}
          loading={loading}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 20,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  greetingText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.backgroundLight,
  },
  selectedMoodCard: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  moodImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedMoodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.successLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  selectedMoodText: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});

export default MoodCheckInScreen;

