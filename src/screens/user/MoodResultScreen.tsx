import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { MoodType } from '../../types';

const { width } = Dimensions.get('window');

interface MoodData {
  day: string;
  mood: number; // 0-3 scale: 0 = sad, 1 = neutral, 2 = happy, 3 = wonderful
}

type PeriodType = 'current' | 'lastWeek';

const MoodResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const selectedMood = (route.params as any)?.mood as MoodType | undefined;
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('current');
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Current mood data (5 days) - matching the image
  const currentMoodData: MoodData[] = [
    { day: 'Day 1', mood: 1 }, // neutral
    { day: 'Day 2', mood: 2 }, // happy (with line going up to sad but no point)
    { day: 'Day 3', mood: 1 }, // neutral
    { day: 'Day 4', mood: 0 }, // sad
    { day: 'Day 5', mood: 2 }, // happy (with dashed horizontal line)
  ];

  // Last week's mood data (7 days)
  const lastWeekMoodData: MoodData[] = [
    { day: 'Mon', mood: 2 }, // happy
    { day: 'Tue', mood: 1 }, // neutral
    { day: 'Wed', mood: 3 }, // wonderful
    { day: 'Thu', mood: 2 }, // happy
    { day: 'Fri', mood: 0 }, // sad
    { day: 'Sat', mood: 2 }, // happy
    { day: 'Sun', mood: 3 }, // wonderful
  ];

  const moodData = selectedPeriod === 'current' ? currentMoodData : lastWeekMoodData;
  const periodOptions = [
    { value: 'current' as PeriodType, label: "Current mood" },
    { value: 'lastWeek' as PeriodType, label: "Last week's mood" },
  ];

  // Mood images for Y-axis (only 3 levels: sad at top, neutral middle, happy at bottom)
  const moodLevels = [
    { level: 0, image: require('../../../assets/Sad.png'), label: 'Sad' },
    { level: 1, image: require('../../../assets/Shy.png'), label: 'Neutral' },
    { level: 2, image: require('../../../assets/Happy.png'), label: 'Happy' },
  ];

  const chartHeight = 200;
  const chartPadding = 25;
  const maxMood = 2; // Only 3 levels: 0, 1, 2
  const minMood = 0;

  // Calculate chart width - ensure it fits or scrolls
  const chartAreaWidth = width - 100; // Account for margins and y-axis
  const minSpacing = 60; // Minimum spacing between points
  const requiredWidth = (moodData.length - 1) * minSpacing;
  const chartWidth = Math.max(chartAreaWidth, requiredWidth);
  const needsScroll = chartWidth > chartAreaWidth;

  const getMoodY = (mood: number) => {
    const normalized = (mood - minMood) / (maxMood - minMood);
    return chartHeight - (normalized * (chartHeight - chartPadding * 2)) - chartPadding;
  };

  const getMoodX = (index: number, dataLength: number) => {
    const spacing = needsScroll ? minSpacing : chartAreaWidth / (dataLength - 1);
    return 50 + index * spacing;
  };

  // Helper to render dashed line
  const renderDashedLine = (x: number, y: number, length: number) => {
    const dashLength = 8;
    const gapLength = 4;
    const dashes = Math.floor(length / (dashLength + gapLength));
    const dashViews = [];

    for (let i = 0; i < dashes; i++) {
      dashViews.push(
        <View
          key={`dash-${i}`}
          style={[
            styles.dashSegment,
            {
              left: x + i * (dashLength + gapLength),
              top: y - 1,
              width: dashLength,
            },
          ]}
        />
      );
    }

    return dashViews;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../../assets/avatar.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.userName}>Truc Quynh</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>Computer Science</Text>
          </View>
        </View>

        {/* Current Mood Card */}
        <View style={styles.moodCard}>
          <View style={styles.moodCardHeader}>
            <TouchableOpacity
              style={styles.periodSelector}
              onPress={() => setShowPeriodModal(true)}
            >
              <Text style={styles.moodCardTitle}>
                {periodOptions.find(opt => opt.value === selectedPeriod)?.label}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Period Selection Modal */}
          <Modal
            visible={showPeriodModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPeriodModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowPeriodModal(false)}
            >
              <View style={styles.modalContent}>
                {periodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.modalOption,
                      selectedPeriod === option.value && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedPeriod(option.value);
                      setShowPeriodModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selectedPeriod === option.value && styles.modalOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedPeriod === option.value && (
                      <Ionicons name="checkmark" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
          {/* Mood Chart */}
          <View style={styles.chartContainer}>
            {/* Y-axis labels with mood images - fixed position */}
            <View style={styles.yAxis}>
              {moodLevels.map((level, index) => {
                const yPosition = getMoodY(level.level);
                return (
                  <View
                    key={level.level}
                    style={[
                      styles.yAxisLabel,
                      {
                        top: yPosition - 17.5, // Center icon (35/2)
                        height: 35,
                      },
                    ]}
                  >
                    <Image
                      source={level.image}
                      style={styles.moodIcon}
                      resizeMode="contain"
                    />
                  </View>
                );
              })}
            </View>

            {/* Chart Area with horizontal scroll if needed */}
            <View style={styles.chartWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={needsScroll}
                contentContainerStyle={[styles.chartScrollContent, { width: needsScroll ? chartWidth : '100%' }]}
                style={styles.chartScrollView}
              >
                <View style={[styles.chartArea, { width: needsScroll ? chartWidth : '100%' }]}>
                  <View style={styles.chart}>
                    {/* Grid lines (dashed vertical lines) */}
                    {moodData.map((_, index) => (
                      <View
                        key={`grid-${index}`}
                        style={[
                          styles.gridLine,
                          { left: getMoodX(index, moodData.length) - 0.5 },
                        ]}
                      />
                    ))}

                    {/* Mood line - simplified approach */}
                    <View style={styles.lineContainer}>
                      {/* Draw lines between points */}
                      {moodData.map((data, index) => {
                        if (index === 0) return null;
                        const x1 = getMoodX(index - 1, moodData.length);
                        const y1 = getMoodY(moodData[index - 1].mood);
                        const x2 = getMoodX(index, moodData.length);
                        const y2 = getMoodY(data.mood);

                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                        // Center point of the line
                        const cx = (x1 + x2) / 2;
                        const cy = (y1 + y2) / 2;

                        return (
                          <View
                            key={`line-${index}`}
                            style={[
                              styles.line,
                              {
                                left: cx - length / 2,
                                top: cy - 1.25, // Half of height (2.5)
                                width: length,
                                transform: [{ rotate: `${angle}deg` }],
                              },
                            ]}
                          />
                        );
                      })}

                      {/* Data points */}
                      {moodData.map((data, index) => {
                        const isLastDay = index === moodData.length - 1;
                        const x = getMoodX(index, moodData.length);
                        const y = getMoodY(data.mood);

                        // Day 5: show dashed horizontal line (for current period)
                        if (isLastDay && selectedPeriod === 'current' && data.day === 'Day 5') {
                          const dashLineLength = needsScroll ? 100 : Math.min(width - x - 100, 150);
                          return (
                            <React.Fragment key={`point-${index}`}>
                              {renderDashedLine(x, y, dashLineLength)}
                              <View style={[styles.pointContainer, { left: x - 5, top: y - 5 }]}>
                                <View style={styles.point} />
                              </View>
                            </React.Fragment>
                          );
                        }

                        // Day 2: show point at happy level (line goes up but no point at sad level)

                        return (
                          <View key={`point-${index}`} style={[styles.pointContainer, { left: x - 4, top: y - 4 }]}>
                            <View style={styles.point} />
                          </View>
                        );
                      })}
                    </View>

                    {/* X-axis labels */}
                    <View style={styles.xAxis}>
                      {moodData.map((data, index) => (
                        <Text
                          key={`label-${index}`}
                          style={[
                            styles.xAxisLabel,
                            { left: getMoodX(index, moodData.length) - 25 },
                          ]}
                        >
                          {data.day}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Encouragement Message */}
          <View style={styles.encouragementContainer}>
            <View style={styles.encouragementIcon}>
              <Text style={styles.encouragementEmoji}>😊</Text>
            </View>
            <View style={styles.encouragementTextContainer}>
              <Text style={styles.encouragementTitle}>You're doing well</Text>
              <Text style={styles.encouragementSubtitle}>Continue keep track of your mood!</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerPlaceholder: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    padding: 3,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  tagContainer: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  moodCard: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 8,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  chartContainer: {
    position: 'relative',
    height: 250,
    marginBottom: 20,
  },
  chartWrapper: {
    marginLeft: 50,
    flex: 1,
    height: '100%',
  },
  chartScrollView: {
    flex: 1,
  },
  chartScrollContent: {
    height: '100%',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: 50,
    zIndex: 1,
  },
  yAxisLabel: {
    position: 'absolute',
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodIcon: {
    width: 35,
    height: 35,
  },
  chartArea: {
    height: '100%',
    position: 'relative',
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    width: 1,
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  lineContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  line: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: Colors.teal,
  },
  pointContainer: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.teal,
    borderWidth: 2.5,
    borderColor: Colors.background,
    shadowColor: Colors.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: Colors.teal,
  },
  dashSegment: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: Colors.teal,
    opacity: 0.5,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 40,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 12,
    color: Colors.textSecondary,
    width: 50,
    textAlign: 'center',
  },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
  },
  encouragementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  encouragementEmoji: {
    fontSize: 20,
  },
  encouragementTextContainer: {
    flex: 1,
  },
  encouragementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  encouragementSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default MoodResultScreen;

