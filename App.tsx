import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import SurveyReminderModal from './src/components/SurveyReminderModal';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserDashboard from './src/screens/user/UserDashboard';
import MoodCheckInScreen from './src/screens/user/MoodCheckInScreen';
import ChatScreen from './src/screens/ChatScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import AppointmentScreen from './src/screens/user/AppointmentScreen';
import AppointmentDetailScreen from './src/screens/user/AppointmentDetailScreen';
import EditAppointmentScreen from './src/screens/user/EditAppointmentScreen';
import MentalHealthTestScreen from './src/screens/user/MentalHealthTestScreen';
import FAQScreen from './src/screens/user/FAQScreen';
import AllDoctorsScreen from './src/screens/user/AllDoctorsScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import AppointmentHistoryScreen from './src/screens/user/AppointmentHistoryScreen';
import UpcomingAppointmentsScreen from './src/screens/user/UpcomingAppointmentsScreen';
import MoodHistoryScreen from './src/screens/user/MoodHistoryScreen';
import MoodResultScreen from './src/screens/user/MoodResultScreen';
import DoctorDetailScreen from './src/screens/user/DoctorDetailScreen';
import CalendarScreen from './src/screens/user/CalendarScreen';
import DoctorDashboard from './src/screens/doctor/DoctorDashboard';
import ExpertDashboard from './src/screens/doctor/ExpertDashboard';

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
import DoctorAppointmentReviewScreen from './src/screens/doctor/DoctorAppointmentReviewScreen';
import DoctorNotificationScreen from './src/screens/doctor/DoctorNotificationScreen';
import JournalScreen from './src/screens/user/JournalScreen';
import * as Sentry from '@sentry/react-native';


Sentry.init({
  dsn: 'https://69bdcec54011562ac38938f2ae1e3e74@o4510663719518208.ingest.de.sentry.io/4510663725613136',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

throw new Error('TEST SENTRY - APP START');


const Stack = createStackNavigator();

export default Sentry.wrap(function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <ActionSheetProvider>
            <NavigationContainer>
              <SurveyReminderModal />
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                  cardStyleInterpolator: ({ current, layouts }) => ({
                    cardStyle: {
                      transform: [
                        {
                          translateX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [layouts.screen.width, 0],
                          }),
                        },
                      ],
                      opacity: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  }),
                  transitionSpec: {
                    open: {
                      animation: 'timing',
                      config: { duration: 250 },
                    },
                    close: {
                      animation: 'timing',
                      config: { duration: 250 },
                    },
                  },
                }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="UserDashboard" component={UserDashboard} />
              <Stack.Screen name="MoodCheckIn" component={MoodCheckInScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="Appointment" component={AppointmentScreen} />
              <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
              <Stack.Screen name="EditAppointment" component={EditAppointmentScreen} />
              <Stack.Screen name="MentalHealthTest" component={MentalHealthTestScreen} />
              <Stack.Screen name="FAQ" component={FAQScreen} />
              <Stack.Screen name="AllDoctors" component={AllDoctorsScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} />
              <Stack.Screen name="UpcomingAppointments" component={UpcomingAppointmentsScreen} />
              <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
              <Stack.Screen name="MoodResult" component={MoodResultScreen} />
              <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
              <Stack.Screen name="ExpertDashboard" component={ExpertDashboard} />
              <Stack.Screen name="DoctorChat" component={ChatScreen} />
              <Stack.Screen name="DoctorChatList" component={ChatListScreen} />
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
              <Stack.Screen name="DoctorAppointmentReview" component={DoctorAppointmentReviewScreen} />
              <Stack.Screen name="DoctorNotification" component={DoctorNotificationScreen} />
              <Stack.Screen name="Journal" component={JournalScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </ActionSheetProvider>
        </SafeAreaProvider>
      </NotificationProvider>
    </AuthProvider>
  );
});