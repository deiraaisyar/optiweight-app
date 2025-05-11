import HomeIcon from '../assets/images/home_icon.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/orang_icon.webp';
import SettingsIcon from '../assets/images/settings-icon.webp';
import LogoutIcon from '../assets/images/log_out_icon.webp';
import FAQIcon from '../assets/images/faq_icon.webp';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import BackIcon from '../assets/images/button_revised.webp';

// Define navigation type
type ProfileScreenNavigationProp = NativeStackNavigationProp<{
  Home: undefined;
  EditProfile: undefined;
  Auth: undefined;
}>;

// User data type definition
type UserData = {
  fullName: string;
  preferredName: string;
  dateOfBirth: any; // Using any for Firestore timestamp
  weight: number;
  gender: string;
  profileCompleted: boolean;
};

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      // If no user is logged in, redirect to Auth screen
      navigation.replace('Auth');
      return;
    }

    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get();

      if (userDoc.exists) {
        const data = userDoc.data() as UserData;

        // Convert Firestore timestamp to Date if it exists
        if (data.dateOfBirth && typeof data.dateOfBirth.toDate === 'function') {
          data.dateOfBirth = data.dateOfBirth.toDate();
        }

        setUserData(data);
      } else {
        Alert.alert(
          'Profile Incomplete',
          'Please complete your profile information.',
        );
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date
      ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
      : 'Not specified';
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // You can create this screen later
    navigation.navigate('EditProfile');
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      navigation.replace('Auth');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          {/* <Text style={styles.infoValue}>Back</Text> */}
          <Image source={BackIcon} style={styles.navIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.preferredName
                ? userData.preferredName.charAt(0).toUpperCase()
                : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {userData?.preferredName || 'User'}
          </Text>
          {/* <Text style={styles.userEmail}>{auth().currentUser?.email}</Text> */}
        </View>
      </View>

      <View style={styles.infoSection}>
        {/* <Text style={styles.sectionTitle}>Personal Information</Text> */}

        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => navigation.navigate('Profile')}>
            <Image source={UserIcon} style={styles.navIcons} />
          </TouchableOpacity>
          <Text style={styles.infoValue}>Personal Detail</Text>
        </View>

        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => navigation.navigate('Profile')}>
            <Image source={SettingsIcon} style={styles.navIcons} />
          </TouchableOpacity>
          <Text style={styles.infoValue}>Settings</Text>
        </View>

        <View style={styles.infoRow}>
          <TouchableOpacity
            style={styles.navItems}
            onPress={() => navigation.navigate('Profile')}>
            <Image source={FAQIcon} style={styles.navIcons} />
          </TouchableOpacity>
          <Text style={styles.infoValue}>FAQ</Text>
        </View>

        <View style={styles.infoRow}>
        <TouchableOpacity
          style={styles.navItems}
          onPress={async () => {
            // Hapus token atau data login
            await AsyncStorage.removeItem('userToken');

            // Reset navigation ke halaman Login (tanpa bisa kembali)
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              })
            );
          }}>
          <Image source={LogoutIcon} style={styles.navIcons} />
        </TouchableOpacity>
        <Text style={styles.infoValue}>Logout</Text>
        </View>
      </View>

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    // backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingTop: 50,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 115,
  },
  profileSection: {
    // backgroundColor: 'white',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 0,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    // backgroundColor: 'white',
    marginTop: 0,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navIcon: {
    width: 33,
    height: 33,
    // marginBottom: 4,
  },
  navIcons: {
    width: 20,
    height: 20,
    // marginBottom: 4,
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
  navItems: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // navIcon: {
  //   width: 24,
  //   height: 24,
  //   marginBottom: 4,
  // },
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

export default ProfileScreen;
