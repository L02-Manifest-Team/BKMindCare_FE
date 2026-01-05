import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { moodService, MoodEntry, MoodType } from '../../services/moodService';

const { width } = Dimensions.get('window');

// Mood info mapping
const moodInfo: Record<MoodType, { 
  label: string; 
  color: string; 
  emoji: string; 
  isPositive: boolean;
  icon: string;
}> = {
  HAPPY: { 
    label: 'Vui vẻ', 
    color: '#4CAF50', 
    emoji: '😊', 
    isPositive: true,
    icon: 'happy',
  },
  EXCITED: { 
    label: 'Hào hứng', 
    color: '#FF9800', 
    emoji: '🤩', 
    isPositive: true,
    icon: 'flash',
  },
  CALM: { 
    label: 'Bình tĩnh', 
    color: '#2196F3', 
    emoji: '😌', 
    isPositive: true,
    icon: 'water',
  },
  SAD: { 
    label: 'Buồn', 
    color: '#9E9E9E', 
    emoji: '😢', 
    isPositive: false,
    icon: 'sad',
  },
  ANXIOUS: { 
    label: 'Lo lắng', 
    color: '#FF5722', 
    emoji: '😰', 
    isPositive: false,
    icon: 'alert-circle',
  },
  STRESSED: { 
    label: 'Căng thẳng', 
    color: '#E91E63', 
    emoji: '😫', 
    isPositive: false,
    icon: 'flame',
  },
  ANGRY: { 
    label: 'Tức giận', 
    color: '#F44336', 
    emoji: '😠', 
    isPositive: false,
    icon: 'flash',
  },
  TIRED: { 
    label: 'Mệt mỏi', 
    color: '#795548', 
    emoji: '😴', 
    isPositive: false,
    icon: 'moon',
  },
};

const MoodHistoryScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState({
    totalCheckIns: 0,
    positiveDays: 0,
    negativeDays: 0,
    mostCommonMood: null as MoodType | null,
    streakCount: 0,
  });

  // Calculate date range based on selected period
  const getDateRange = (period: 'week' | 'month' | 'year') => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  // Calculate statistics
  const calculateStatistics = useCallback((entries: MoodEntry[]) => {
    if (entries.length === 0) {
      setStatistics({
        totalCheckIns: 0,
        positiveDays: 0,
        negativeDays: 0,
        mostCommonMood: null,
        streakCount: 0,
      });
      return;
    }

    const moodCounts: Record<MoodType, number> = {
      HAPPY: 0,
      EXCITED: 0,
      CALM: 0,
      SAD: 0,
      ANXIOUS: 0,
      STRESSED: 0,
      ANGRY: 0,
      TIRED: 0,
    };

    let positiveDays = 0;
    let negativeDays = 0;

    entries.forEach(entry => {
      moodCounts[entry.mood]++;
      if (moodInfo[entry.mood].isPositive) {
        positiveDays++;
      } else {
        negativeDays++;
      }
    });

    // Find most common mood
    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0] as MoodType] > moodCounts[b[0] as MoodType] ? a : b
    )[0] as MoodType;

    // Calculate streak - parse dates correctly
    let streakCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entryDates = new Set<string>();
    entries.forEach(entry => {
      // Parse created_at correctly
      let dateStr = entry.created_at;
      if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        dateStr = dateStr + 'Z';
      }
      const date = new Date(dateStr);
      const localDateStr = date.toISOString().split('T')[0];
      entryDates.add(localDateStr);
    });
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (entryDates.has(dateStr)) {
        streakCount++;
      } else if (i > 0) {
        break;
      }
    }

    setStatistics({
      totalCheckIns: entries.length,
      positiveDays,
      negativeDays,
      mostCommonMood,
      streakCount,
    });
  }, []);

  // Load mood history
  const loadMoodHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(selectedPeriod);
      console.log('Loading mood history for period:', selectedPeriod, 'from', start, 'to', end);
      
      const history = await moodService.getMoodHistory(start, end, 365);
      console.log('Loaded mood history:', history.length, 'entries');
      
      // Group by date and keep latest entry for each date
      const entriesMap = new Map<string, MoodEntry>();
      history.forEach(entry => {
        // Parse created_at correctly
        let dateStr = entry.created_at;
        if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
          dateStr = dateStr + 'Z';
        }
        const date = new Date(dateStr);
        const localDateStr = date.toISOString().split('T')[0];
        
        if (!entriesMap.has(localDateStr) || new Date(entry.created_at) > new Date(entriesMap.get(localDateStr)!.created_at)) {
          entriesMap.set(localDateStr, entry);
        }
      });
      
      const sortedEntries = Array.from(entriesMap.values()).sort((a, b) => {
        let dateA = a.created_at;
        let dateB = b.created_at;
        if (typeof dateA === 'string' && !dateA.endsWith('Z') && !dateA.includes('+') && !dateA.includes('-', 10)) {
          dateA = dateA + 'Z';
        }
        if (typeof dateB === 'string' && !dateB.endsWith('Z') && !dateB.includes('+') && !dateB.includes('-', 10)) {
          dateB = dateB + 'Z';
        }
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      
      console.log('Processed entries:', sortedEntries.length);
      
      setMoodEntries(sortedEntries);
      setFilteredEntries(sortedEntries);
      
      // Calculate statistics
      calculateStatistics(sortedEntries);
    } catch (error) {
      console.error('Error loading mood history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod, calculateStatistics]);

  useFocusEffect(
    useCallback(() => {
      loadMoodHistory();
    }, [loadMoodHistory])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMoodHistory();
  }, [loadMoodHistory]);

  const getMoodColor = (mood: MoodType) => {
    return moodInfo[mood]?.color || Colors.textSecondary;
  };

  const getMoodLabel = (mood: MoodType) => {
    return moodInfo[mood]?.label || mood;
  };

  const getMoodEmoji = (mood: MoodType) => {
    return moodInfo[mood]?.emoji || '😐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatPeriodLabel = (period: 'week' | 'month' | 'year') => {
    switch (period) {
      case 'week':
        return 'Tuần';
      case 'month':
        return 'Tháng';
      case 'year':
        return 'Năm';
    }
  };

  const positivePercentage = filteredEntries.length > 0
    ? Math.round((statistics.positiveDays / filteredEntries.length) * 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lịch sử cảm xúc</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Period Selector */}
      <View style={styles.periodContainer}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={styles.periodButtonWrapper}
          >
            <View style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriodButton
            ]}>
              <Text style={[
                styles.periodText,
                selectedPeriod === period && styles.selectedPeriodText
              ]}>
                {formatPeriodLabel(period)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: Colors.background }]}>
              <Text style={styles.statNumber}>{statistics.totalCheckIns}</Text>
              <Text style={styles.statLabel}>Tổng số ngày</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.background }]}>
              <Text style={styles.statNumber}>{statistics.streakCount}</Text>
              <Text style={styles.statLabel}>Ngày liên tiếp</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors.background }]}>
              <Text style={styles.statNumber}>{positivePercentage}%</Text>
              <Text style={styles.statLabel}>Tích cực</Text>
            </View>
          </View>

          {/* Most Common Mood - Hero Card */}
          {statistics.mostCommonMood && (
            <View style={styles.heroContainer}>
              <View style={[
                styles.heroCard,
                { backgroundColor: Colors.background }
              ]}>
                <View style={styles.heroContent}>
                  <View style={styles.heroTextContainer}>
                    <Text style={styles.heroTitle}>Cảm xúc phổ biến nhất</Text>
                    <Text style={styles.heroLabel}>
                      {getMoodLabel(statistics.mostCommonMood)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Mood Distribution - Visual Chart */}
          {filteredEntries.length > 0 && (
            <View style={styles.distributionContainer}>
              <Text style={styles.sectionTitle}>Phân bố cảm xúc</Text>
              <View style={styles.distributionGrid}>
                {Object.entries(moodInfo)
                  .filter(([mood]) => {
                    const count = filteredEntries.filter(e => e.mood === mood).length;
                    return count > 0;
                  })
                  .map(([mood, info]) => {
                    const count = filteredEntries.filter(e => e.mood === mood).length;
                    const percentage = filteredEntries.length > 0
                      ? Math.round((count / filteredEntries.length) * 100)
                      : 0;
                    
                    return (
                      <TouchableOpacity
                        key={mood}
                        style={styles.distributionCard}
                        activeOpacity={0.8}
                      >
                        <View style={[
                          styles.distributionCardContent,
                          { backgroundColor: Colors.background }
                        ]}>
                          <Text style={styles.distributionEmoji}>{info.emoji}</Text>
                          <Text style={styles.distributionLabel}>{info.label}</Text>
                          <View style={styles.distributionBarContainer}>
                            <View style={styles.distributionBar}>
                              <View
                                style={[
                                  styles.distributionBarFill,
                                  {
                                    width: `${percentage}%`,
                                    backgroundColor: info.color,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <View style={styles.distributionStats}>
                            <Text style={[styles.distributionCount, { color: Colors.text }]}>{count}</Text>
                            <Text style={[styles.distributionPercentage, { color: Colors.textSecondary }]}>{percentage}%</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            </View>
          )}

          {/* Mood Entries List */}
          <View style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lịch sử chi tiết</Text>
              <Text style={styles.sectionSubtitle}>{filteredEntries.length} mục</Text>
            </View>
            {filteredEntries.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyCard, { backgroundColor: Colors.background }]}>
                  <Text style={styles.emptyText}>Chưa có lịch sử cảm xúc</Text>
                  <Text style={styles.emptySubtext}>
                    Hãy bắt đầu ghi nhận cảm xúc của bạn ngay hôm nay!
                  </Text>
                </View>
              </View>
            ) : (
              filteredEntries.map((entry, index) => {
                const info = moodInfo[entry.mood];
                return (
                  <TouchableOpacity
                    key={entry.id}
                    activeOpacity={0.8}
                    style={styles.moodCardWrapper}
                  >
                    <View style={[
                      styles.moodCard,
                      { backgroundColor: Colors.background }
                    ]}>
                      <View style={styles.moodCardContent}>
                        <View style={[
                          styles.moodIconContainer,
                          { backgroundColor: info.color + '20' }
                        ]}>
                          <Text style={styles.moodEmoji}>{info.emoji}</Text>
                        </View>
                        <View style={styles.moodInfo}>
                          <Text style={styles.moodType}>{info.label}</Text>
                          <Text style={styles.moodDate}>{formatDate(entry.created_at)}</Text>
                        </View>
                        <View style={[
                          styles.moodBadge,
                          { backgroundColor: info.isPositive ? Colors.successLight : Colors.pinkLight }
                        ]}>
                          <View
                            style={[
                              styles.moodBadgeDot,
                              { backgroundColor: info.isPositive ? Colors.success : Colors.error },
                            ]}
                          />
                          <Text style={[
                            styles.moodBadgeText,
                            { color: info.isPositive ? Colors.success : Colors.error }
                          ]}>
                            {info.isPositive ? 'Tích cực' : 'Tiêu cực'}
                          </Text>
                        </View>
                      </View>
                      {entry.notes && (
                        <View style={styles.noteContainer}>
                          <Text style={styles.noteText}>{entry.notes}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  periodContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  periodButtonWrapper: {
    flex: 1,
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectedPeriodText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  heroLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  distributionContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
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
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  distributionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  distributionCard: {
    width: (width - 44) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  distributionCardContent: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distributionEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  distributionBarContainer: {
    width: '100%',
    marginBottom: 8,
  },
  distributionBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  distributionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  distributionPercentage: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  emptyContainer: {
    marginTop: 8,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  moodCardWrapper: {
    marginBottom: 16,
  },
  moodCard: {
    borderRadius: 20,
    padding: 16,
  },
  moodCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodInfo: {
    flex: 1,
  },
  moodType: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  moodDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  moodBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

export default MoodHistoryScreen;
