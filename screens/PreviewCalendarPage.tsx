import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import CalendarIcon from '../assets/images/calendar_icon.webp';
import BackIcon from '../assets/images/back_button.webp';

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

const PreviewCalendarPage = () => {
  const navigation = useNavigation();
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  const [activities, setActivities] = useState<
    { title: string; time: string; color: string }[]
  >([]);

  useEffect(() => {
    const dates = getWeekDates();
    setWeekDates(dates);
    setActiveDate(dates[0]); // Default ke hari Senin
  }, []);

  useEffect(() => {
    if (activeDate) {
      fetchActivities(activeDate);
    }
  }, [activeDate]);

  const fetchActivities = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const snapshot = await firestore()
        .collection('events')
        .where('day', '==', formattedDate)
        .get();

      const fetchedActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          title: data.title,
          time: `${new Date(data.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${new Date(data.end).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
          color: data.type === 'Workout' ? '#42A5F5' : '#FFD54F', // Warna berdasarkan tipe
        };
      });

      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
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

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <View style={styles.streakIcon}>
          <Image source={CalendarIcon} style={styles.streakIconImage} />
        </View>
        <View style={styles.streakTextContainer}>
          <Text style={styles.streakTitle}>Amazing work on your 34th streak!</Text>
          <Text style={styles.streakSubtitle}>
            While studying for your academics, ease your time management by setting up a workout
            schedule along with your class schedule.
          </Text>
        </View>
      </View>

      {/* Date Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {weekDates.map((date, index) => {
          const isActive = activeDate?.toDateString() === date.toDateString();
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
                  {date.toDateString().split(' ')[1]} {date.getDate()}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Activities */}
      <View>
        <Text style={styles.activitiesTitle}>Workout day</Text>
        {activities.length > 0 ? (
          activities.map((item, idx) => (
            <View key={idx} style={styles.activityContainer}>
              <View style={[styles.activityIndicator, { backgroundColor: item.color }]} />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noActivitiesText}>No activities for this day.</Text>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Image source={HomeIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Library')}>
          <Image source={BookOpenIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Notification')}>
          <Image source={NotificationIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
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
  activitiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  },
  activityTime: {
    fontSize: 13,
    color: '#757575',
  },
  noActivitiesText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 12,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#B7E1FF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 11,
    color: '#333',
  },
});

export default PreviewCalendarPage;
