import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

const LandingScreen = ({navigation}: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome To</Text>

      {/* Logo Aplikasi */}
      <Image
        source={require('../assets/images/optiweight-logo.webp')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.desc}>
        Start your journey in optimizing your weight and healthy
      </Text>

      {/* Tombol ke Login */}
      {/* <Button title="Login" onPress={() => navigation.navigate('Auth')} /> */}

      <TouchableOpacity
        onPress={() => navigation.navigate('Auth')}
        style={{
          backgroundColor: '#007AFF',
          width: 180,
          padding: 10,
          borderRadius: 40,
          marginTop: 20,
          alignItems: 'center', // Untuk membuat teks di tengah
          paddingTop: 6, // Menambahkan jarak atas
        }}>
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontFamily: 'Inter-Bold',
            textAlign: 'center',
          }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 100,
  },
  logo: {
    width: 200,
    height: 65,
    marginBottom: 24,
  },
  desc: {
    fontSize: 12,
    fontWeight: 'medium',
    marginBottom: 24,
    textAlign: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'medium',
    marginBottom: 0,
    textAlign: 'center',
  },
});

export default LandingScreen;
