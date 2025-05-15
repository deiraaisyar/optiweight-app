import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import CalendarIcon from '../assets/images/calendar_icon.webp';
import BackIcon from '../assets/images/back_button.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';

const getWeekDates = () => {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    return date;
  });
  return weekDates;
};

const getDayName = (date: Date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const PreviewCalendarPage = () => {
  const navigation = useNavigation();
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const getUser = async () => {
      const user = auth().currentUser;
      setCurrentUser(user);
      if (user) {
        const dates = getWeekDates();
        setWeekDates(dates);
        setActiveDate(dates[0]);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (activeDate && currentUser) {
      fetchActivities(activeDate);
    }
  }, [activeDate, currentUser]);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const user = auth().currentUser;
        if (user) {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data();
            setStreak(data?.streakCount || 0); // Ambil streakCount dari Firestore
          }
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      }
    };

    fetchStreak();
  }, []);

  const fetchActivities = async (date: Date) => {
    try {
      setLoading(true);
      const dayName = getDayName(date);
      
      const snapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('events')
        .where('day', '==', dayName)
        .get();

      const fetchedActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        const isWorkout = data.type === 'Workout';
        return {
          id: doc.id,
          title: data.title,
          time: `${new Date(data.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${new Date(data.end).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          color: isWorkout ? '#42A5F5' : '#FFD54F',
          type: data.type,
          completed: data.completed || false
        };
      });

      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Streak Card */}
          <View style={styles.streakCard}>
            <View style={styles.streakIcon}>
              <Image source={CalendarIcon} style={styles.streakIconImage} />
            </View>
            <View style={styles.streakTextContainer}>
              <Text style={styles.streakTitle}>Amazing work on your {streak}th streak!</Text>
              <Text style={styles.streakSubtitle}>
                While studying for your academics, ease your time management by setting up a workout
                schedule along with your class schedule.
              </Text>
            </View>
          </View>

          {/* Date Scroll */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateScroll}
          >
            {weekDates.map((date, index) => {
              const isActive = activeDate?.toDateString() === date.toDateString();
              const dayName = getDayName(date);
              const dateNumber = date.getDate();
              return (
                <View key={index} style={styles.dateContainer}>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      isActive ? styles.dateButtonActive : styles.dateButtonInactive,
                    ]}
                    onPress={() => setActiveDate(date)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        isActive ? styles.dateTextActive : styles.dateTextInactive,
                      ]}
                    >
                      {dayName} {dateNumber}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Activities Section */}
          <View style={styles.activitiesSection}>
            {activities.length > 0 ? (
              <>
                {/* Workout Section */}
                {activities.some(a => a.type === 'Workout') && (
                  <View style={styles.workoutContainer}>
                    <Text style={styles.activitiesTitle}>Workout day</Text>
                    {activities
                      .filter(a => a.type === 'Workout')
                      .map((item, idx) => (
                        <View key={`workout-${idx}`} style={styles.activityContainer}>
                          <View style={[styles.activityIndicator, { backgroundColor: item.color }]} />
                          <View style={styles.activityTextContainer}>
                            <Text style={styles.activityTitle}>{item.title}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                            <Text style={[
                              styles.activityStatus,
                              item.completed ? styles.completedStatus : styles.pendingStatus
                            ]}>
                              {item.completed ? 'Completed' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {/* Classes Section */}
                {activities.some(a => a.type === 'Classes') && (
                  <View style={styles.classesContainer}>
                    <Text style={styles.activitiesTitle}>Class schedule</Text>
                    {activities
                      .filter(a => a.type === 'Classes')
                      .map((item, idx) => (
                        <View key={`class-${idx}`} style={styles.activityContainer}>
                          <View style={[styles.activityIndicator, { backgroundColor: item.color }]} />
                          <View style={styles.activityTextContainer}>
                            <Text style={styles.activityTitle}>{item.title}</Text>
                            <Text style={styles.activityTime}>{item.time}</Text>
                            <Text style={[
                              styles.activityStatus,
                              item.completed ? styles.completedStatus : styles.pendingStatus
                            ]}>
                              {item.completed ? 'Completed' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.noActivitiesText}>No activities for this day.</Text>
            )}
          </View>
        </ScrollView>
      )}

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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakIcon: {
    backgroundColor: '#F06292',
    padding: 8,
    borderRadius: 50,
    marginRight: 12,
  },
  streakIconImage: {
    width: 24,
    height: 24,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 13,
    color: '#000',
  },
  dateScroll: {
    marginBottom: 16,
  },
  dateContainer: {
    marginHorizontal: 4,
  },
  dateButton: {
    borderRadius: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  dateButtonActive: {
    backgroundColor: '#42A5F5',
  },
  dateButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  dateTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateTextInactive: {
    color: '#000',
  },
  activitiesSection: {
    marginTop: 8,
  },
  workoutContainer: {
    marginBottom: 16,
  },
  classesContainer: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#42A5F5',
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  activityIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
    marginRight: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: '#757575',
  },
  activityStatus: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  completedStatus: {
    color: '#10B981',
  },
  pendingStatus: {
    color: '#F59E0B',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 24,
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
  
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default PreviewCalendarPage;