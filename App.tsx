import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import AuthScreen from './screens/AuthScreenTest';
import LandingScreen from './screens/LandingScreen';
import RegisterPage from './screens/RegisterPage';
import UserDataScreen from './screens/UserDataScreen';
import ChatBotLandingPage from './screens/ChatBotLandingPage';
import HomePage from './screens/HomePage';
import ChatBotMain from './screens/ChatBotMain';
import ProfilePage from './screens/ProfilePage';
import CalendarLanding from './screens/CalendarLandingPage';
import NotificiationsPage from './screens/NotificationPage';
import CalendarMain from './screens/CalendarMain';
import PreviewCalendar from './screens/PreviewCalendarPage';
import ProfileLandingPage from './screens/ProfileLanding';

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