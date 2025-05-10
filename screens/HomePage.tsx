import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Import ikon untuk navbar
import HomeIcon from '../assets/images/home_icon.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';

type HomePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type UserData = {
  fullName: string;
  preferredName: string;
  dateOfBirth: any;
  weight: number;
  gender: string;
  profileCompleted: boolean;
};

type WorkoutEvent = {
  id: string;
  day: string;
  type: string;
  title: string;
  start: string;
  end: string;
};

const CalendarIcon = () => <Text style={{fontSize: 28}}>📅</Text>;

const HomePage = () => {
  const navigation = useNavigation<HomePageNavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [workoutEvents, setWorkoutEvents] = useState<WorkoutEvent[]>([]);
  const [currentStreakActive, setCurrentStreakActive] = useState<boolean>(false);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<number>(0);
  const [streakHistory, setStreakHistory] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    fetchUserData();
    fetchWorkoutEvents();
  }, []);

  const fetchUserData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      navigation.replace('Auth');
      return;
    }

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data() as UserData;
        
        if (data.dateOfBirth && typeof data.dateOfBirth.toDate === 'function') {
          data.dateOfBirth = data.dateOfBirth.toDate();
        }
        
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutEvents = async () => {
    try {
      const snapshot = await firestore()
        .collection('events')
        .where('type', '==', 'Workout')
        .get();

      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutEvent[];

      setWorkoutEvents(events);
      checkCurrentStreak(events);
      calculateWeeklyWorkouts(events);
      updateStreakHistory();
    } catch (error) {
      console.error('Error fetching workout events:', error);
    }
  };

  const checkCurrentStreak = (events: WorkoutEvent[]) => {
    const now = new Date();
    const currentDay = now.getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayName = dayNames[currentDay];

    const todayWorkouts = events.filter(event => event.day === todayName);

    for (const event of todayWorkouts) {
      const startTime = new Date(event.start);
      const endTime = new Date(event.end);
      
      if (now >= startTime && now <= endTime) {
        setCurrentStreakActive(true);
        return;
      }
    }

    setCurrentStreakActive(false);
  };

  const calculateWeeklyWorkouts = (events: WorkoutEvent[]) => {
    // Count unique workout days in the current week
    const uniqueDays = new Set(events.map(event => event.day));
    setWeeklyWorkouts(uniqueDays.size);
  };

  const updateStreakHistory = () => {
    // Simulate streak history for the last 4 weeks
    // In a real app, you would fetch this from your database
    setStreakHistory([3, 5, 2, 4]); // Example data
  };

  const handleStreakPress = () => {
    if (currentStreakActive) {
      setStreakCount(prev => prev + 1);
      // Here you would also update the streak in your database
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
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome Back {userData?.preferredName || 'User'}!</Text>
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
              <Text style={[styles.statNumber, styles.workoutNumber]}>{weeklyWorkouts}</Text>
            </View>
            <Text style={styles.statLabel}>Weekly Workout</Text>
          </View>
          
          <View style={styles.statItem}>
            <TouchableOpacity 
              onPress={handleStreakPress}
              style={[
                styles.statCircle, 
                currentStreakActive ? styles.activeStreakCircle : styles.inactiveStreakCircle
              ]}
            >
              <Text style={[styles.statNumber, currentStreakActive ? styles.activeStreakNumber : styles.inactiveStreakNumber]}>
                {streakCount}
              </Text>
            </TouchableOpacity>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Streak Graph */}
        <View style={styles.graphContainer}>
          <Text style={styles.graphTitle}>April 2025</Text>
          <Text style={styles.graphSubtitle}>Weekly Streak, Keep it up!</Text>
          
          <LineChart
            data={{
              labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
              datasets: [
                {
                  data: streakHistory,
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#3b82f6"
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
  
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleContent}>
            <Text style={styles.cardTitle}>Set up your personalized workout schedule!</Text>
            <Text style={styles.cardSubtitle}>
              The journey of a thousand miles begins with a single step
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.buttonText} onPress={() => navigation.navigate('CalendarLanding')}>
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
              small, is a step toward a stronger body and a clearer mind."
            </Text>
          </View>
        </View>
      </ScrollView>
  
      {/* Navbar */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 100,
    backgroundColor: '#fff',
  },
  profileSection: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 0,
    alignItems: 'center',
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
    backgroundColor: '#fcd34d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleCard: {
    backgroundColor: '#dbeafe',
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
    color: '#4b5563',
  },
  cardDescription: {
    fontSize: 12,
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 16,
    width: '48%',
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#dbeafe',
  },
  activeStreakCircle: {
    backgroundColor: '#3b82f6',
  },
  inactiveStreakCircle: {
    backgroundColor: '#d1d5db',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  workoutNumber: {
    color: '#3b82f6',
  },
  activeStreakNumber: {
    color: '#ffffff',
  },
  inactiveStreakNumber: {
    color: '#6b7280',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    marginBottom: 24,
    alignSelf: 'left',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 40,
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
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  graphSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
});

export default HomePage;