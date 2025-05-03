// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   TextInput,
//   Button,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import auth from '@react-native-firebase/auth';
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';
// import {GOOGLE_WEB_CLIENT_ID} from '@env';

// // BACKEND
// type RootStackParamList = {
//   Auth: undefined;
//   Home: undefined;
// };

// const RegisterPage = () => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   const navigation =
//     useNavigation<NativeStackNavigationProp<RootStackParamList>>();

//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: GOOGLE_WEB_CLIENT_ID,
//       offlineAccess: true,
//     });
//   }, []);

//   const signUp = async () => {
//     try {
//       await auth().createUserWithEmailAndPassword(email, password);
//       setError('');
//       Alert.alert('User created successfully!');
//       navigation.navigate('Home');
//     } catch (e: any) {
//       setError(e.message);
//     }
//   };

//   // FRONTEND
//   return (
//     <View style={styles.container}>
//       <Text style={styles.createAccount}>Create your account</Text>

//       <Text style={styles.welcome}>Welcome to</Text>
//       {/* <Text style={styles.logo}>Optiweight ↑</Text> */}
//       <Image
//         source={require('../assets/images/optiweight-logo.webp')}
//         style={styles.logo}
//       />
//       <Text style={styles.subtitle}>
//         REGISTER
//       </Text>

//       <TextInput
//         placeholder="Email"
//         value={email}
//         onChangeText={setEmail}
//         style={styles.input}
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <TextInput
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//         style={styles.input}
//       />

//       <TouchableOpacity style={styles.loginButton} onPress={signUp}>
//         <Text style={styles.loginText}>SignUp</Text>
//       </TouchableOpacity>

//       {error ? <Text style={styles.error}>{error}</Text> : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 30,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//   },
//   createAccount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     position: 'absolute',
//     top: 60,
//     left: 30,
//   },
//   welcome: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginBottom: 5,
//   },
//   // logo: {
//   //   fontSize: 30,
//   //   fontWeight: 'bold',
//   //   textAlign: 'center',
//   //   color: '#000',
//   // },
//   logo: {
//     width: 200,
//     height: 60,
//     alignSelf: 'center',
//     resizeMode: 'contain',
//     marginBottom: 10,
//   },
//   subtitle: {
//     textAlign: 'center',
//     color: 'gray',
//     marginBottom: 30,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 15,
//   },
//   loginButton: {
//     backgroundColor: '#007AFF',
//     padding: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   loginText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   googleButton: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderRadius: 25,
//     padding: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   googleText: {
//     marginLeft: 5,
//     color: '#000',
//   },
//   error: {
//     color: 'red',
//     marginTop: 10,
//     textAlign: 'center',
//   },
// });

// export default RegisterPage;


import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

// BACKEND
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
};

const RegisterPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const validatePasswords = (): boolean => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const signUp = async () => {
    // Reset error state
    setError('');
    
    // Validate passwords match
    if (!validatePasswords()) {
      return;
    }
    
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert('User created successfully!');
      navigation.navigate('Home');
    } catch (e: any) {
      setError(e.message);
    }
  };

  // FRONTEND
  return (
    <View style={styles.container}>
      <Text style={styles.createAccount}>Create your account</Text>

      <Text style={styles.welcome}>Welcome to</Text>
      <Image
        source={require('../assets/images/optiweight-logo.webp')}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>
        REGISTER
      </Text>

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
    fontSize: 18,
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