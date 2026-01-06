import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQScreen = () => {
  const navigation = useNavigation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment by going to the Appointments section, selecting a doctor, and choosing an available time slot. You can choose between in-person or anonymous chat appointments.',
    },
    {
      id: '2',
      question: 'Is the service free for students?',
      answer: 'Yes, BKMindCare is a free service provided for all HCMUT students. You can access counseling sessions, mental health tests, and support chat at no cost.',
    },
    {
      id: '3',
      question: 'How do I cancel or reschedule an appointment?',
      answer: 'You can cancel or reschedule your appointment by going to the Appointments section, selecting your appointment, and choosing the cancel or reschedule option. Please do this at least 24 hours before your appointment.',
    },
    {
      id: '4',
      question: 'What is the difference between a counselor and an expert?',
      answer: 'Counselors provide general mental health support and guidance. Experts are specialized professionals who can provide more in-depth support for specific mental health concerns.',
    },
    {
      id: '5',
      question: 'How does the anonymous chat work?',
      answer: 'The anonymous chat allows you to talk with mental health experts without revealing your identity. Your conversations are confidential and secure. You can access it from the Support chat option in Services.',
    },
    {
      id: '6',
      question: 'Can I take mental health tests multiple times?',
      answer: 'Yes, you can take the mental health assessments as many times as you need. However, keep in mind that these are screening tools and should not replace professional diagnosis.',
    },
    {
      id: '7',
      question: 'What should I do in case of emergency?',
      answer: 'If you are experiencing a mental health emergency, please contact emergency services immediately (113) or go to the nearest hospital. BKMindCare is not a crisis service.',
    },
  ];

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.introText}>
            Frequently Asked Questions about BKMindCare
          </Text>

          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleItem(faq.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons
                  name={expandedItems.has(faq.id) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              {expandedItems.has(faq.id) && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}

          <View style={styles.contactBox}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.contactText}>
              Still have questions? Contact us through Support chat or email us at support@bkmindcare.edu.vn
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 50,
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
  introText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  contactBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default FAQScreen;

