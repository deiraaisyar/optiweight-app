import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  ScrollView,
  Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// Import icons for navbar
import HomeIcon from '../assets/images/home_icon.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import CalendarIcon from '../assets/images/calendar_icon.webp';

type HomePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type UserData = {
  fullName: string;
  preferredName: string;
  dateOfBirth: any;
  weight: number;
  height?: number; 
  gender: string;
  profileCompleted: boolean;
  streakCount?: number;
  weeklyWorkouts?: number;
  streakHistory?: number[];
  lastStreakUpdate?: any;
};

type WorkoutEvent = {
  id: string;
  day: string;
  type: string;
  title: string;
  start: any;
  end: any;
  completed?: boolean;
};

const HomePage = () => {
  const navigation = useNavigation<HomePageNavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<number>(0);
  const [streakHistory, setStreakHistory] = useState<number[]>([0, 0, 0, 0]);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<Date | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutEvent | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [currentStreakActive, setCurrentStreakActive] = useState<boolean>(false);
  const [workoutEvents, setWorkoutEvents] = useState<WorkoutEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [buttonPressed, setButtonPressed] = useState(false);
  const [streakCountWeek, setStreakCountWeek] = useState<number[]>([0, 0, 0, 0]);
  const [currentWeek, setCurrentWeek] = useState<number>(getCurrentWeek());
  const [monthlyStreakData, setMonthlyStreakData] = useState<number[]>([0, 0, 0, 0]);
  const [lastStreakUpdate, setLastStreakUpdate] = useState<Date | null>(null);
  const [lastWeek, setLastWeek] = useState<number>(getCurrentWeek());

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      await fetchWorkoutEvents();
      setLoading(false); // Pastikan loading diubah menjadi false
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (workoutEvents.length > 0) {
      findTodayWorkout(workoutEvents);
      checkCurrentStreak(workoutEvents);
      calculateWeeklyWorkouts(workoutEvents);
    }
  }, [workoutEvents]);

  useEffect(() => {
    if (workoutEvents.length > 0) {
      calculateMonthlyStreakData(workoutEvents, currentDate.getMonth(), currentDate.getFullYear());
    }
  }, [currentDate, workoutEvents]);

  useEffect(() => {
    console.log('Streak Count Updated:', streakCount);
  }, [streakCount]);

  useEffect(() => {
    console.log('Streak History Updated:', streakHistory);
  }, [streakHistory]);

  useEffect(() => {
    const initializeStreak = async () => {
      await fetchStreakData();
      await checkStreakReset();
    };

    initializeStreak();
  }, []); // Pastikan hanya dipanggil sekali saat komponen dimuat

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const response = await fetch(`http://192.168.0.108:5000/api/users/${auth().currentUser?.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      console.log('User data fetched:', data);
      setUserData(data);
      setStreakCount(data.streakCount || 0);
      setLastStreakUpdate(data.lastStreakUpdate ? new Date(data.lastStreakUpdate) : null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false); // Pastikan loading diubah menjadi false
    }
  };

  const fetchWorkoutEvents = async () => {
    try {
      console.log('Fetching workout events...');
      const response = await fetch(`http://192.168.0.108:5000/api/events/${auth().currentUser?.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workout events');
      }
      const events = await response.json();
      console.log('Workout events fetched:', events);
      setWorkoutEvents(events);
    } catch (error) {
      console.error('Error fetching workout events:', error);
    }
  };  
  
  const findTodayWorkout = (events: WorkoutEvent[]) => {
    const now = new Date();
    const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const todayWorkouts = events.filter(event => event.day === todayName);

    console.log('Current Time:', now);
    console.log('Today Name:', todayName);
    console.log('Today Workouts:', todayWorkouts);

    for (const event of todayWorkouts) {
      const startTime = new Date(event.start);
      const endTime = new Date(event.end);

      console.log('Checking Workout:', event.title);
      console.log('Start Time:', startTime, 'End Time:', endTime);

      if (now >= startTime && now <= endTime) {
        console.log('Today Workout Found:', event.title);
        setTodayWorkout(event);
        return;
      }
    }

    console.log('No workout scheduled for today.');
    setTodayWorkout(null);
  };

  const checkCurrentStreak = (events: WorkoutEvent[]) => {
    const now = new Date();
    const todayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const todayWorkouts = events.filter(event => event.day === todayName);

    console.log('Current Time:', now);
    console.log('Today Workouts:', todayWorkouts);

    let streakActive = false;

    for (const event of todayWorkouts) {
      const startTime = new Date(event.start);
      const endTime = new Date(event.end);

      console.log('Checking Workout:', event.title);
      console.log('Start Time:', startTime, 'End Time:', endTime);

      if (now >= startTime && now <= endTime && !event.completed) {
        console.log('Streak is active for workout:', event.title);
        setCurrentStreakActive(true);
        streakActive = true;
        return;
      }
    }

    const completedToday = todayWorkouts.some(event => event.completed);
    console.log('Completed Today:', completedToday);

    if (!streakActive && !completedToday) {
      console.log('No active streak or completed workout today. Resetting streak count to 0.');
      setCurrentStreakActive(false);
      setStreakCount(0);
      updateStreakInDatabase(0);
    } else {
      console.log('Workout completed today. Streak count remains unchanged.');
    }
  };

  const calculateWeeklyWorkouts = (events: WorkoutEvent[]) => {
    const completedWorkouts = events.filter(event => event.completed);
    const uniqueDays = new Set(completedWorkouts.map(event => event.day));
    setWeeklyWorkouts(uniqueDays.size); // Hitung ulang tanpa mereset
  };

  const calculateStreakCountWeek = (events: WorkoutEvent[]) => {
    const weeks = [0, 0, 0, 0]; // Array untuk menyimpan streak per minggu
    const now = new Date();

    events.forEach(event => {
      const eventDate = new Date(event.start);
      const dayOfMonth = eventDate.getDate();

      // Tentukan minggu ke berapa berdasarkan tanggal
      let weekIndex = Math.floor((dayOfMonth - 1) / 7);

      // Jika minggu ke-4 (sisa hari), pastikan index tidak melebihi 3
      if (weekIndex > 3) weekIndex = 3;

      // Tambahkan streak jika event sudah selesai
      if (event.completed && eventDate.getMonth() === now.getMonth()) {
        weeks[weekIndex]++;
      }
    });

    console.log('Streak Count per Week:', weeks);
    setStreakCountWeek(weeks);
  };

  const calculateMonthlyStreakData = (events: WorkoutEvent[], month: number, year: number) => {
    const weeks = [0, 0, 0, 0]; // Reset data untuk 4 minggu

    events.forEach(event => {
      const eventDate = new Date(event.start);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        const dayOfMonth = eventDate.getDate();
        let weekIndex = Math.floor((dayOfMonth - 1) / 7);
        if (weekIndex > 3) weekIndex = 3; // Pastikan minggu ke-4 tidak melebihi index 3

        if (event.completed) {
          weeks[weekIndex]++;
        }
      }
    });

    console.log(`Monthly Streak Data for ${month + 1}/${year}:`, weeks);
    setMonthlyStreakData(weeks);
  };

  const updateStreakInDatabase = async (newStreakCount: number) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      const now = new Date();
      await firestore().collection('users').doc(currentUser.uid).update({
        streakCount: newStreakCount,
        lastStreakUpdate: now,
      });
      setLastWorkoutDate(now);
      console.log(`Streak count updated to ${newStreakCount} in the database.`);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const fetchStreakData = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setStreakCount(userData.streakCount || 0);
        setLastStreakUpdate(userData.lastStreakUpdate?.toDate() || null);
        setWeeklyWorkouts(userData.weeklyWorkouts || 0);
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  };

  const updateStreakData = async (newStreakCount: number, newWeeklyWorkouts: number) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      const now = new Date();
      await firestore().collection('users').doc(currentUser.uid).update({
        streakCount: newStreakCount,
        lastStreakUpdate: now,
        weeklyWorkouts: newWeeklyWorkouts,
      });
      setLastStreakUpdate(now);
      setStreakCount(newStreakCount);
      setWeeklyWorkouts(newWeeklyWorkouts);
    } catch (error) {
      console.error('Error updating streak data:', error);
    }
  };

  const handleStreakPress = async () => {
    if (!todayWorkout || todayWorkout.completed) return;

    try {
      await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .collection('events')
        .doc(todayWorkout.id)
        .update({ completed: true });

      setTodayWorkout({ ...todayWorkout, completed: true });

      const newStreakCount = streakCount + 1;
      const newWeeklyWorkouts = weeklyWorkouts + 1;

      await updateStreakData(newStreakCount, newWeeklyWorkouts); // Pastikan nilai yang benar dikirim
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const checkStreakReset = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    const now = new Date();
    const lastUpdate = lastStreakUpdate || new Date(0);

    // Reset streak jika tidak ada workout yang selesai hari ini
    if (now.toDateString() !== lastUpdate.toDateString()) {
      console.log('No workout completed today. Resetting streak.');
      await updateStreakData(0, weeklyWorkouts);
    }

    // Reset weekly workouts jika minggu baru dimulai
    const currentWeek = getCurrentWeek();
    if (currentWeek !== lastWeek) {
      console.log('New week detected. Resetting weekly workouts.');
      await updateStreakData(streakCount, 0);
      setLastWeek(currentWeek);
    }
  };

  const markWorkoutAsCompleted = async () => {
    if (!todayWorkout) return;

    try {
      await firestore()
        .collection('users')
        .doc(auth().currentUser?.uid)
        .collection('events')
        .doc(todayWorkout.id)
        .update({ completed: true });

      const newStreakCount = streakCount + 1;
      const newWeeklyWorkouts = weeklyWorkouts + 1;

      await updateStreakData(newStreakCount, newWeeklyWorkouts);
    } catch (error) {
      console.error('Error marking workout as completed:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
  };

  const removePastEvents = async () => {
    try {
      const response = await fetch(`http://192.168.0.108:5000/api/events/${auth().currentUser?.uid}/past-events`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove past events');
      }
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error removing past events:', error);
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
                todayWorkout?.completed ? styles.completedStreakCircle : styles.activeStreakCircle,
              ]}
              disabled={todayWorkout?.completed}
            >
              <Text
                style={[
                  styles.statNumber,
                  todayWorkout?.completed ? styles.completedStreakNumber : styles.activeStreakNumber,
                ]}
              >
                {streakCount}
              </Text>
            </TouchableOpacity>
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
              <Text style={styles.buttonText} onPress={() => navigation.navigate('CalendarLanding')}>
                Preview personalized calendar
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarIconContainer}>
            <Image source={CalendarIcon} style={{width: 100, height: 100}} />
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

        {/* Streak Counter Section - Always visible */}
        <View style={styles.streakCounterCard}>
          <Text style={styles.streakCounterTitle}>Streak Counter</Text>

          {todayWorkout ? (
            <View style={styles.streakTimeRow}>
              <View style={styles.streakTimeColumn}>
                <Text style={styles.streakTimeLabel}>Starts</Text>
                <Text style={styles.streakTimeValue}>
                  {formatTime(new Date(todayWorkout.start))}
                </Text>
              </View>

              <View style={styles.streakTimeColumn}>
                <Text style={styles.streakTimeLabel}>Ends</Text>
                <Text style={styles.streakTimeValue}>
                  {formatTime(new Date(todayWorkout.end))}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noWorkoutText}>No workout scheduled for today</Text>
          )}

          <TouchableOpacity
            onPress={handleStreakPress}
            style={[
              styles.streakCounterButton,
              !currentStreakActive && { backgroundColor: '#d1d5db' }
            ]}
            disabled={buttonPressed || !currentStreakActive}
          >
            <Text
              style={[
                styles.streakCounterButtonText,
                !currentStreakActive && styles.completedButtonText
              ]}
            >
              {streakCount} Streak
            </Text>
          </TouchableOpacity>
        </View>
  
        {/* Streak Graph */}
        <View style={styles.graphContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={handlePreviousMonth}>
              <Text style={{ fontSize: 18, color: '#007AFF' }}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.graphTitle}>{formatMonthYear(currentDate)}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text style={{ fontSize: 18, color: '#007AFF' }}>▶</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.graphSubtitle}>Weekly Streak, Keep it up!</Text>
          
          <BarChart
            data={{
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: [
                {
                  data: monthlyStreakData, // Data dinamis berdasarkan bulan dan tahun
                },
              ],
            }}
            width={Dimensions.get('window').width - 60}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(6, 190, 156, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: '#e3e3e3',
                strokeDasharray: '0',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
              marginLeft: -10,
            }}
            showValuesOnTopOfBars
          />
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
  scheduleCard: {
    backgroundColor: '#B7E1FF',
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
    paddingBottom: 16,
  },
  infoCard: {
    backgroundColor: '#B7E1FF',
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
  completedStreakCircle: {
    backgroundColor: '#d1d5db', // Warna abu-abu untuk tombol selesai
    borderWidth: 1,
    borderColor: '#9ca3af', // Border abu-abu
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
  completedStreakNumber: {
    color: '#6b7280', // Warna teks abu-abu
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
    fontSize: 12,
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
  streakCounterCard: {
    backgroundColor: '#B7E1FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakCounterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  streakCounterSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  streakTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  streakTimeColumn: {
    alignItems: 'center',
    width: '48%',
  },
  streakTimeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  streakTimeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakCounterButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 16,
  },
  streakCounterButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  completedButtonText: {
    color: '#6b7280',
  },
  noWorkoutText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default HomePage;

function getCurrentWeek() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfWeek = startOfMonth.getDay();
  return Math.ceil((now.getDate() + dayOfWeek) / 7);
}