import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';


// BACKEND
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const AuthScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID, 
      offlineAccess: true,
    });
  }, []);

  const signUp = async () => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      setError('');
      Alert.alert('User created successfully!');
      navigation.navigate('Home');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const signIn = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      setError('');
      Alert.alert('Logged in successfully!');
      navigation.navigate('Home');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In Result:', signInResult);

      const idToken = signInResult?.idToken || signInResult?.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found in Google Sign-In result');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);

      setError('');
      Alert.alert('Logged in with Google!');
      navigation.navigate('Home');
    } catch (e: any) {
      console.log('Google Sign-In Error:', e);
      setError(e.message || 'Google Sign-In failed');
    }
  };

  // FRONTEND
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Sign Up" onPress={signUp} />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Login with Google" onPress={signInWithGoogle} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 4,
  },
  error: {
    marginTop: 10,
    color: 'red',
  },
});

export default AuthScreen;
