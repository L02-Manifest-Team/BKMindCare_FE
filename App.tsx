import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import UserDashboard from './src/screens/user/UserDashboard';
import MoodCheckInScreen from './src/screens/user/MoodCheckInScreen';
import ChatScreen from './src/screens/user/ChatScreen';
import ChatListScreen from './src/screens/user/ChatListScreen';
import AppointmentScreen from './src/screens/user/AppointmentScreen';
import AppointmentDetailScreen from './src/screens/user/AppointmentDetailScreen';
import MentalHealthTestScreen from './src/screens/user/MentalHealthTestScreen';
import FAQScreen from './src/screens/user/FAQScreen';
import AllDoctorsScreen from './src/screens/user/AllDoctorsScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import AppointmentHistoryScreen from './src/screens/user/AppointmentHistoryScreen';
import MoodHistoryScreen from './src/screens/user/MoodHistoryScreen';
import MoodResultScreen from './src/screens/user/MoodResultScreen';
import DoctorDetailScreen from './src/screens/user/DoctorDetailScreen';
import CalendarScreen from './src/screens/user/CalendarScreen';
import DoctorDashboard from './src/screens/doctor/DoctorDashboard';
import ExpertDashboard from './src/screens/doctor/ExpertDashboard';
import DoctorChatScreen from './src/screens/doctor/DoctorChatScreen';
import DoctorChatListScreen from './src/screens/doctor/DoctorChatListScreen';
import DoctorCalendarScreen from './src/screens/doctor/DoctorCalendarScreen';
import DoctorProfileScreen from './src/screens/doctor/DoctorProfileScreen';
import DoctorAppointmentDetailScreen from './src/screens/doctor/DoctorAppointmentDetailScreen';
import RatingScreen from './src/screens/doctor/RatingScreen';
import PatientStatsScreen from './src/screens/doctor/PatientStatsScreen';
import DetailAppointmentScreen from './src/screens/doctor/DetailAppointmentScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import StudentNotificationScreen from './src/screens/user/StudentNotificationScreen';
import AboutScreen from './src/screens/user/AboutScreen';
import EditProfileScreen from './src/screens/user/EditProfileScreen';
import SettingsScreen from './src/screens/user/SettingsScreen';
import DoctorAboutScreen from './src/screens/doctor/AboutScreen';
import DoctorEditProfileScreen from './src/screens/doctor/EditProfileScreen';
import DoctorSettingsScreen from './src/screens/doctor/SettingsScreen';
import DoctorHelpSupportScreen from './src/screens/doctor/HelpSupportScreen';
import DoctorAppointmentHistoryScreen from './src/screens/doctor/DoctorAppointmentHistoryScreen';



const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserDashboard" component={UserDashboard} />
          <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
          <Stack.Screen name="ChatList" component={ChatListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Appointment" component={AppointmentScreen} />
          <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
          <Stack.Screen name="MentalHealthTest" component={MentalHealthTestScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="AllDoctors" component={AllDoctorsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} />
          <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
          <Stack.Screen name="MoodResult" component={MoodResultScreen} />
          <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
          <Stack.Screen name="ExpertDashboard" component={ExpertDashboard} />
          <Stack.Screen name="DoctorChat" component={DoctorChatScreen} />
          <Stack.Screen name="DoctorChatList" component={DoctorChatListScreen} />
          <Stack.Screen name="DoctorCalendar" component={DoctorCalendarScreen} />
          <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
          <Stack.Screen name="DoctorAppointmentDetail" component={DoctorAppointmentDetailScreen} />
          <Stack.Screen name="Rating" component={RatingScreen} />
          <Stack.Screen name="PatientStats" component={PatientStatsScreen} />
          <Stack.Screen name="DetailAppointment" component={DetailAppointmentScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="StudentNotification" component={StudentNotificationScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="DoctorAbout" component={DoctorAboutScreen} />
          <Stack.Screen name="DoctorEditProfile" component={DoctorEditProfileScreen} />
          <Stack.Screen name="DoctorSettings" component={DoctorSettingsScreen} />
          <Stack.Screen name="DoctorHelpSupport" component={DoctorHelpSupportScreen} />
          <Stack.Screen name="DoctorAppointmentHistory" component={DoctorAppointmentHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

