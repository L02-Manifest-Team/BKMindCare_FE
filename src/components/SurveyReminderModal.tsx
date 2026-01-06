import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Storage } from '../utils/storage';

const SURVEY_LAST_SHOWN_KEY = 'survey_last_shown_at';
// 2 ngày (có thể coi như 2.5 ngày để không quá dày)
const REMINDER_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;

const SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSeLSGiHWHVWj9L7K_u-4j_aJEb4utrZMrvO9RokqXupaILU8g/viewform?usp=sharing&ouid=103487856263317226505';

const SurveyReminderModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkAndShowReminder = async () => {
      try {
        const stored = await Storage.getItem(SURVEY_LAST_SHOWN_KEY);
        const now = Date.now();

        if (stored) {
          const lastShown = Number(stored);
          // Nếu parse lỗi thì coi như chưa hiện
          if (!isNaN(lastShown)) {
            const diff = now - lastShown;
            if (diff < REMINDER_INTERVAL_MS) {
              return;
            }
          }
        }

        // Đủ điều kiện hiện popup
        setVisible(true);
        await Storage.setItem(SURVEY_LAST_SHOWN_KEY, String(now));
      } catch (error) {
        console.error('Error checking survey reminder:', error);
      }
    };

    checkAndShowReminder();
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpenSurvey = async () => {
    try {
      const supported = await Linking.canOpenURL(SURVEY_URL);
      if (supported) {
        await Linking.openURL(SURVEY_URL);
      } else {
        console.warn('Cannot open survey URL');
      }
    } catch (error) {
      console.error('Error opening survey URL:', error);
    } finally {
      setVisible(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Cảm ơn bạn đã trải nghiệm BKMindCare</Text>
          <Text style={styles.message}>
            Bạn có thể giúp tụi mình cải thiện ứng dụng tốt hơn cho sinh viên bằng
            một khảo sát nhỏ (khoảng 2–3 phút). Mọi phản hồi đều ẩn danh và rất
            quý giá với tụi mình 💙
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
              <Text style={styles.secondaryButtonText}>Để sau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleOpenSurvey}>
              <Text style={styles.primaryButtonText}>Thực hiện khảo sát</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default SurveyReminderModal;


