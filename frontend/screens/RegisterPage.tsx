import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types'; // Import RootStackParamList

type RegisterPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const RegisterPage = ({ navigation }: { navigation: RegisterPageNavigationProp }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const signUp = async () => {
    setError(''); // Reset error state

    // Validasi input
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Inisialisasi Firebase App dan Firestore
      const app = getApp();
      const db = getFirestore(app);

      // Buat akun pengguna
      await auth().createUserWithEmailAndPassword(email, password);
      console.log('User created successfully!');

      const user = auth().currentUser;
      if (user) {
        // Buat dokumen pengguna di Firestore
        await db.collection('users').doc(user.uid).set({
          profileCompleted: false, // Tandai bahwa data belum lengkap
        });

        // Arahkan ke UserDataScreen
        navigation.navigate('UserData');
      }
    } catch (e: any) {
      setError(e.message);
      console.error('Error during sign-up:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.createAccount}>Create your account</Text>

      <Text style={styles.welcome}>Welcome to</Text>
      <Image
        source={require('../assets/images/optiweight-logo.webp')}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>REGISTER</Text>

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
      <TextInput
        placeholder="Re-enter Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.loginButton} onPress={signUp}>
        <Text style={styles.loginText}>SignUp</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  createAccount: {
    fontSize: 20.4,
    fontWeight: 'bold',
    position: 'absolute',
    top: 60,
    left: 30,
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: 'gray',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterPage;