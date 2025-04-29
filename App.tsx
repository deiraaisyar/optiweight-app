import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native'; // Import View and Text from react-native
import AuthScreen from './screens/AuthScreenTest'; // Ini coba buat ngetest doang

// Nanti sisanya di code di sini
// Dummy HomeScreen component
const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to the Home Screen!</Text>
    </View>
  );
};

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        {/* AuthScreen as the first screen */}
        <Stack.Screen name="Auth" component={AuthScreen} />
        {/* Add HomeScreen to the stack */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
