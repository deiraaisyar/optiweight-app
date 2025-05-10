import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types'; // Import RootStackParamList
// import {useNavigation} from '@react-navigation/native';
// import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// import BackIcon from '../assets/images/button_revised.webp';

// Import ikon untuk navbar
import HomeIcon from '../assets/images/home_icon.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';

type HomePageNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;
// User data type definition
type UserData = {
  fullName: string;
  preferredName: string;
  dateOfBirth: any; // Using any for Firestore timestamp
  weight: number;
  gender: string;
  profileCompleted: boolean;
};

const CalendarIcon = () => <Text style={{fontSize: 28}}>📅</Text>;

const HomePage = () => {
  const navigation = useNavigation<HomePageNavigationProp>();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigationzz = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      // If no user is logged in, redirect to Auth screen
      navigationzz.replace('Auth');
      return;
    }

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data() as UserData;
        
        // Convert Firestore timestamp to Date if it exists
        if (data.dateOfBirth && typeof data.dateOfBirth.toDate === 'function') {
          data.dateOfBirth = data.dateOfBirth.toDate();
        }
        
        setUserData(data);
      } else {
        Alert.alert('Profile Incomplete', 'Please complete your profile information.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : 'Not specified';
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    // You can create this screen later
    navigationzz.navigate('EditProfile');
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

  // return (
  //   <View style={styles.container}>
  //     <View style={styles.header}>
  //       <Text style={styles.welcomeText}>Welcome Back!</Text>
  //     </View>

  //     <View style={styles.profileSection}>
  //       <View style={styles.avatarContainer}>
  //         <View style={styles.avatar}>
  //           <Text style={styles.avatarText}>
  //             {userData?.preferredName ? userData.preferredName.charAt(0).toUpperCase() : 'U'}
  //           </Text>
  //         </View>
  //         {/* <Text style={styles.userName}>{userData?.preferredName || 'User'}</Text>
  //         <Text style={styles.userEmail}>{auth().currentUser?.email}</Text> */}
  //       </View>
  //     </View>

  //     <View style={styles.statsContainer}>
  //       {/* Weekly Workout Stat */}
  //       <View style={styles.statItem}>
  //         <View style={[styles.statCircle, styles.workoutCircle]}>
  //           <Text style={[styles.statNumber, styles.workoutNumber]}>asep</Text>
  //         </View>
  //         <Text style={styles.statLabel}>Weekly Workout</Text>
  //       </View>

  //       {/* Streak Stat */}
  //       <View style={styles.statItem}>
  //         <View style={[styles.statCircle, styles.streakCircle]}>
  //           <Text style={[styles.statNumber, styles.streakNumber]}>asep</Text>
  //         </View>
  //         <Text style={styles.statLabel}>Streak</Text>
  //       </View>
  //     </View>

  //     <View style={styles.scheduleCard}>
  //       <View style={styles.scheduleContent}>
  //         <Text style={styles.cardTitle}>
  //           Set up your personalized workout schedule!
  //         </Text>
  //         <Text style={styles.cardSubtitle}>
  //           The journey of a thousand miles begins with a single step
  //         </Text>
  //         <TouchableOpacity style={styles.scheduleButton}>
  //           <Text style={styles.buttonText}>Start personalized schedule</Text>
  //         </TouchableOpacity>
  //       </View>
  //       <View style={styles.calendarIconContainer}>
  //         <CalendarIcon />
  //       </View>
  //     </View>

  //     {/* Info Cards Section */}
  //     <View style={styles.infoCardsContainer}>
  //       {/* AI Chatbox Card */}
  //       <View style={styles.infoCard}>
  //         <Text style={styles.cardTitle}>AI Chatbox</Text>
  //         <Text style={styles.cardSubtitle}>Have a conversation with me!</Text>
  //         <Text style={styles.cardDescription}>
  //           The AI Chatbox provides users a platform to gain new knowledge
  //           tailored to reach their goals.
  //         </Text>
  //         <TouchableOpacity style={styles.chatButton}>
  //           <Text
  //             style={styles.buttonText}
  //             onPress={() => navigation.navigate('ChatBotLanding')}>
  //             Visit AI Chatbox
  //           </Text>
  //         </TouchableOpacity>
  //       </View>

  //       {/* Motivational Quote Card */}
  //       <View style={styles.infoCard}>
  //         <Text style={styles.quoteText}>
  //           "A healthy weight isn't about perfection or restrictions. It's about
  //           balance, strength, and self-respect. Every workout, no matter how
  //           small, is a step toward a stronger body and a clearer mind." 
  //         </Text>
  //       </View>
  //     </View>

  //     {/* Bottom Navigation */}
  //     <View style={styles.navbar}>
  //       <TouchableOpacity style={styles.navItem}>
  //         <Image source={HomeIcon} style={styles.navIcon} />
  //         <Text style={styles.navText}>Home</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.navItem}>
  //         <Image source={BookOpenIcon} style={styles.navIcon} />
  //         <Text style={styles.navText}>Library</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.navItem}>
  //         <Image source={NotificationIcon} style={styles.navIcon} />
  //         <Text style={styles.navText}>Notification</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity
  //         style={styles.navItem}
  //         onPress={() => navigation.navigate('Profile')}>
  //         <Image source={UserIcon} style={styles.navIcon} />
  //         <Text style={styles.navText}>Profile</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );
  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
        </View>
  
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userData?.preferredName ? userData.preferredName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
        </View>
  
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statCircle, styles.workoutCircle]}>
              <Text style={[styles.statNumber, styles.workoutNumber]}>asep</Text>
            </View>
            <Text style={styles.statLabel}>Weekly Workout</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statCircle, styles.streakCircle]}>
              <Text style={[styles.statNumber, styles.streakNumber]}>asep</Text>
            </View>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
  
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleContent}>
            <Text style={styles.cardTitle}>Set up your personalized workout schedule!</Text>
            <Text style={styles.cardSubtitle}>
              The journey of a thousand miles begins with a single step
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.buttonText}
              onPress={() => navigation.navigate('CalendarLanding')}>
              Start personalized schedule
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarIconContainer}>
            <CalendarIcon />
          </View>
        </View>
  
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>AI Chatbox</Text>
            <Text style={styles.cardSubtitle}>Have a conversation with me!</Text>
            <Text style={styles.cardDescription}>
              The AI Chatbox provides users a platform to gain new knowledge
              tailored to reach their goals.
            </Text>
            <TouchableOpacity style={styles.chatButton}>
              <Text
                style={styles.buttonText}
                onPress={() => navigation.navigate('ChatBotLanding')}>
                Visit AI Chatbox
              </Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.infoCard}>
            <Text style={styles.quoteText}>
              "A healthy weight isn't about perfection or restrictions. It's about
              balance, strength, and self-respect. Every workout, no matter how
              small, is a step toward a stronger body and a clearer mind." dfilkjfklajkljkdfhkahkahskdslkjd;ajdlsa;k
            </Text>
          </View>
        </View>
      </ScrollView>
  
      {/* Navbar tetap di bawah */}
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
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 100, // Supaya konten gak ketiban navbar
    alignItems: 'center',
    backgroundColor: '#fff',
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
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  calendarIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fcd34d', // yellow-300
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleCard: {
    backgroundColor: '#dbeafe', // blue-100
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 16,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#4b5563', // gray-600
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#3b82f6', // blue-500
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  chatButton: {
    backgroundColor: '#3b82f6', // blue-500
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginHorizontal: 15,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#dbeafe', // blue-100
    borderRadius: 16,
    padding: 16,
    width: '48%',
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statbox: {
    flexDirection: 'row',
    gap: 20,
    marginHorizontal: 10,
    // alignContent: 'center',
    // justifyContent:
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 32,
    width: 80,
  },
  statCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutCircle: {
    backgroundColor: '#dbeafe', // blue-100
  },
  streakCircle: {
    backgroundColor: '#ffedd5', // orange-100
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutNumber: {
    color: '#3b82f6', // blue-500
  },
  streakNumber: {
    color: '#f97316', // orange-500
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6', // blue-500
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
    // textAlign: 'left',
    alignSelf: 'left',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 40,
    // marginTop: 40,
  },
  aibox: {
    backgroundColor: '#B7E1FF',
    width: '45%',
    borderRadius: 16,
    padding: 20,
    height: 150,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // marginBottom: 20,
    // alignSelf: start
  },
  selamattitle: {
    fontSize: 16,
    // fontWeight: 'bold',
    // marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: 160,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d1d5db', // gray-300
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomePage;