import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import AuthScreen from './frontend/screens/AuthScreenTest';
import LandingScreen from './frontend/screens/LandingScreen';
import RegisterPage from './frontend/screens/RegisterPage';
import UserDataScreen from './frontend/screens/UserDataScreen';
import ChatBotLandingPage from './frontend/screens/ChatBotLandingPage';
import HomePage from './frontend/screens/HomePage';
import ChatBotMain from './frontend/screens/ChatBotMain';
import ProfilePage from './frontend/screens/ProfilePage';
import CalendarLanding from './frontend/screens/CalendarLandingPage';
import NotificiationsPage from './frontend/screens/NotificationPage';
import CalendarMain from './frontend/screens/CalendarMain';
import PreviewCalendar from './frontend/screens/PreviewCalendarPage';
import ProfileLandingPage from './frontend/screens/ProfileLanding';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserData"
          component={UserDataScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatBotLanding"
          component={ChatBotLandingPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfilePage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProfileLanding"
          component={ProfileLandingPage}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChatBotMain"
          component={ChatBotMain}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificiationsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalendarLanding"
          component={CalendarLanding}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CalendarMain"
          component={CalendarMain}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PreviewCalendar"
          component={PreviewCalendar}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;