import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AiLogo from '../assets/images/ai_logo.webp';
import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import BackIcon from '../assets/images/back_button.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import { RootStackParamList } from '../types'; // Import RootStackParamList

type ChatBotLandingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatBotLanding'>;

const AIChatboxScreen = ({ navigation }: { navigation: ChatBotLandingNavigationProp }) => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image source={BackIcon} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Fit Buddy</Text>

      {/* Logo */}
      <Image source={AiLogo} style={[styles.logo, { width: 160, height: 160 }]} />

      {/* Deskripsi */}
      <Text style={styles.desc}>
        Gain new knowledge! Interact with AI to enhance your understanding about{'\n'}
        health, weight and workout tips.
      </Text>

      {/* Tombol Continue */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ChatBotMain')}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}>
          <Image source={HomeIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ChatBotLanding')}>
          <Image source={BubbleChatIcon} style={styles.navIcon} />
          <Text style={styles.navText}>AI Chatbot</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Notification')}>
          <Image source={NotificationIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProfileLanding')}>
          <Image source={UserIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  logo: {
    marginVertical: 24,
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
    fontFamily: 'Inter-Bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 999,
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 35,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#B7E1FF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Inter-Regular',
  },
});

export default AIChatboxScreen;