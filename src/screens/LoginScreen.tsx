import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { CustomButton } from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const navigation = useNavigation();

  const handleHCMUTLogin = () => {
    // TODO: Implement HCMUT authentication
    // For now, navigate to user dashboard
    navigation.navigate('UserDashboard' as never);
  };

  const handleAdminLogin = () => {
    // TODO: Implement admin authentication
    navigation.navigate('DoctorDashboard' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>BKMindCare</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Ready? Log in using account on:</Text>

        <TouchableOpacity
          style={styles.accountButton}
          onPress={handleHCMUTLogin}
          activeOpacity={0.7}
        >
          <View style={styles.accountButtonContent}>
            <View style={styles.accountIcon}>
              <Image 
                source={require('../../assets/bk.png')} 
                style={styles.bkIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.accountButtonText}>HCMUT account</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.adminButtonText}>Psychologist</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          Nếu bạn cần hỗ trợ hoặc có câu hỏi, vui lòng{' '}
          <Text style={styles.helpLink}>liên hệ với chúng tôi để được hỗ trợ</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 250,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: 200,
    height: 200,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  accountButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  accountButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  bkIcon: {
    width: 28,
    height: 28,
  },
  accountButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  adminButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    alignItems: 'center',
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  helpText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  helpLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;

