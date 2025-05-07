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

// const AuthScreen = () => {
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

//   const signIn = async () => {
//     try {
//       await auth().signInWithEmailAndPassword(email, password);
//       setError('');
//       Alert.alert('Logged in successfully!');
//       navigation.navigate('Home');
//       // navigation.navigate("UserData");
//     } catch (e: any) {
//       setError(e.message);
//     }
//   };

//   const signInWithGoogle = async () => {
//     try {
//       await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

//       const signInResult = await GoogleSignin.signIn();
//       console.log('Google Sign-In Result:', signInResult);

//       const idToken = signInResult?.idToken || signInResult?.data?.idToken;

//       if (!idToken) {
//         throw new Error('No ID token found in Google Sign-In result');
//       }

//       const googleCredential = auth.GoogleAuthProvider.credential(idToken);
//       await auth().signInWithCredential(googleCredential);

//       setError('');
//       Alert.alert('Logged in with Google!');
//       navigation.navigate('Home');
//     } catch (e: any) {
//       console.log('Google Sign-In Error:', e);
//       setError(e.message || 'Google Sign-In failed');
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
//         Start your journey in optimizing your{'\n'}weight and healthy
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

//       {/* <TouchableOpacity style={styles.loginButton} onPress={signUp}>
//         <Text style={styles.loginText}>SignUp</Text>
//       </TouchableOpacity> */}

//       <TouchableOpacity style={styles.loginButton} onPress={signIn}>
//         <Text style={styles.loginText}>Login</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
//         <Text style={styles.googleText}>Log in with Google</Text>
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

// export default AuthScreen;



import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { RootStackParamList } from '../types'; // Import RootStackParamList

// BACKEND
type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const navigation = useNavigation<AuthScreenNavigationProp>();

  const signIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      setError('');
      
      // Check if user profile is complete
      checkUserProfileComplete();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const checkUserProfileComplete = async () => {
    const user = auth().currentUser;
    
    if (!user) {
      return; // This shouldn't happen, but just in case
    }
    
    try {
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (userDoc.exists && userDoc.data()?.profileCompleted) {
        // Profile is complete, navigate to Home
        navigation.navigate('Home');
      } else {
        // Profile is incomplete, navigate to UserData
        navigation.navigate('UserData');
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      // Default to UserData screen on error
      navigation.navigate('UserData');
    }
  };

  // Function to navigate to registration page
  const goToRegister = () => {
    navigation.navigate('Register');
  };

  // FRONTEND
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome to</Text>
      <Image
        source={require('../assets/images/optiweight-logo.webp')}
        style={styles.logo}
      />
      <Text style={styles.subtitle}>
        LOGIN
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

      <TouchableOpacity style={styles.loginButton} onPress={signIn}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={goToRegister}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#333',
  },
  registerLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

export default AuthScreen;