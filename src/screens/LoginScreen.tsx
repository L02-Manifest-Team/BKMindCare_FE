import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { moodService } from '../services/moodService';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const userProfile = await login(email, password);
      
      if (userProfile.role === 'DOCTOR') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DoctorDashboard' as never }],
        });
      } else {
        const hasCheckedIn = await moodService.hasTodayCheckIn();
        if (hasCheckedIn) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserDashboard' as never }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MoodCheckIn' as never }],
          });
        }
      }
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.detail || 
                          error.message || 
                          'Email hoặc mật khẩu không đúng';
      Alert.alert('Đăng nhập thất bại', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E3F2FD', '#BBDEFB', '#E1F5FE']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Title */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>BKMindCare</Text>
            <Text style={styles.tagline}>Chăm sóc sức khỏe tinh thần</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Đăng nhập</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={22} color="#4A90E2" />
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#4A90E2" />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* HCMUT Button */}
            <TouchableOpacity style={styles.hcmutBtn} disabled={loading}>
              <Image
                source={require('../../assets/bk.png')}
                style={styles.bkIcon}
                resizeMode="contain"
              />
              <Text style={styles.hcmutBtnText}>Đăng nhập bằng HCMUT</Text>
            </TouchableOpacity>

            {/* Register */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.registerLink}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  tagline: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  // Input
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  // Forgot
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '600',
  },
  // Login Button
  loginBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  // HCMUT
  hcmutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bkIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  hcmutBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Register
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 15,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});

export default LoginScreen;
