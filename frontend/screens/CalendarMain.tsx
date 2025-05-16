import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {GOOGLE_WEB_CLIENT_ID} from '@env';

// Import icons
import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import KananIcon from '../assets/images/button_kanan.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import BackIcon from '../assets/images/back_button.webp';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID, // Pastikan ini diatur dengan benar di .env
  scopes: ['https://www.googleapis.com/auth/calendar'], // Izin untuk mengakses Google Calendar
  offlineAccess: true,
});

const CalendarMain = ({navigation}: {navigation: any}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [eventType, setEventType] = useState<'Classes' | 'Workout' | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [lastStreakUpdate, setLastStreakUpdate] = useState<Date | null>(null);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Changed to start with Sunday

  useEffect(() => {
    const initialize = async () => {
      const user = auth().currentUser;
      setCurrentUser(user);

      if (user) {
        await fetchEvents(user.uid);
        await removePastEvents(); // Hapus kegiatan yang sudah lewat
        await fetchStreakData(); // Ambil data streak
      }
    };

    initialize();
  }, []);

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setDropdownVisible(false);
    setEventType(option === 'Classes' ? 'Classes' : 'Workout');
  };

  const resetForm = () => {
    setEventTitle('');
    setStartTime(null);
    setEndTime(null);
    setEventType(null);
    setSelectedOption('Select');
    setSelectedDay(null);
  };

  const handleAddEvent = async () => {
    console.log('handleAddEvent called');

    if (!currentUser || !selectedDay || !eventType || !eventTitle || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields.');
      console.log('Validation failed:', {
        currentUser,
        selectedDay,
        eventType,
        eventTitle,
        startTime,
        endTime,
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Validation passed');

      const dayIndex = days.indexOf(selectedDay);
      const today = new Date();
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + ((dayIndex - today.getDay() + 7) % 7));

      const eventStart = new Date(nextDay);
      eventStart.setHours(startTime.getHours());
      eventStart.setMinutes(startTime.getMinutes());

      const eventEnd = new Date(nextDay);
      eventEnd.setHours(endTime.getHours());
      eventEnd.setMinutes(endTime.getMinutes());

      // Pindahkan log setelah deklarasi eventStart dan eventEnd
      console.log('Calculated eventStart:', eventStart.toISOString());
      console.log('Calculated eventEnd:', eventEnd.toISOString());

      const newEvent = {
        day: selectedDay,
        type: eventType,
        title: eventTitle,
        start: eventStart.toISOString(),
        end: eventEnd.toISOString(),
        completed: false,
        userId: currentUser.uid,
        googleCalendarEventId: null,
      };

      const userEventsRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('events');

      console.log('New Event Data:', newEvent);

      const firestoreResponse = await userEventsRef.add(newEvent);
      console.log('Firestore Response ID:', firestoreResponse.id);

      const eventId = firestoreResponse.id;

      if (isGoogleSignedIn) {
        try {
          const tokens = await GoogleSignin.getTokens();
          if (!tokens.accessToken) {
            throw new Error('No Google access token available');
          }

          console.log('Google Access Token:', tokens.accessToken);

          // Kirim permintaan ke Google Calendar API
          const response = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: `${eventType}: ${eventTitle}`,
                description: `Added via OptiWeight App`,
                start: {
                  dateTime: eventStart.toISOString(),
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                  dateTime: eventEnd.toISOString(),
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Calendar API Error:', errorData);
            throw new Error(errorData.error?.message || 'Google Calendar API error');
          }

          const googleEventData = await response.json();
          console.log('Google Calendar Event Data:', googleEventData);

          // Perbarui Firestore dengan ID event Google Calendar
          await userEventsRef.doc(eventId).update({
            googleCalendarEventId: googleEventData.id,
          });

          console.log('Google Calendar Event ID saved to Firestore:', googleEventData.id);
        } catch (error) {
          console.error('Error adding event to Google Calendar:', error);
          Alert.alert('Error', 'Failed to add event to Google Calendar');
        }
      }

      setEvents(prev => [...prev, { id: eventId, ...newEvent }]);
      resetForm();
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      Alert.alert(
        'Success',
        isGoogleSignedIn
          ? 'Event added to both your app and Google Calendar!'
          : 'Event added to your app calendar!'
      );
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert('Error', error.message || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://192.168.0.108:5000/api/events/${auth().currentUser?.uid}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google Calendar API Error:', errorData);
        throw new Error(errorData.error?.message || 'Google Calendar API error');
      }
      const events = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchStreakData = async () => {
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

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setIsGoogleSignedIn(true);
      Alert.alert('Success', 'Google Calendar connected!');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to connect Google Calendar');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      setIsGoogleSignedIn(false);
      Alert.alert('Success', 'Disconnected from Google Calendar');
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  };

  const removePastEvents = async () => {
    if (!currentUser) return;

    try {
      const now = new Date();
      const userEventsRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('events');

      // Ambil semua event dari Firestore
      const snapshot = await userEventsRef.get();
      console.log('Current Time:', now);
      console.log('Event End Time:', eventEnd, 'Is Past:', isPast, 'Is Completed:', isCompleted);

      // Filter event yang sudah lewat atau sudah selesai
      const pastEvents = snapshot.docs.filter(doc => {
        const eventData = doc.data();
        const eventEnd = new Date(eventData.end); // Konversi ke Date object
        const isPast = eventEnd < now;
        const isCompleted = eventData.completed === true;

        console.log('Event:', eventData.title, 'End Time:', eventEnd, 'Is Past:', isPast, 'Is Completed:', isCompleted);
        return isPast || isCompleted; // Hapus jika salah satu kondisi terpenuhi
      });

      // Hapus event yang memenuhi kondisi
      for (const event of pastEvents) {
        await userEventsRef.doc(event.id).delete();
        console.log(`Deleted past/completed event: ${event.id}`);
      }

      // Perbarui daftar event lokal
      setEvents(prevEvents =>
        prevEvents.filter(event => {
          const eventEnd = new Date(event.end);
          return eventEnd >= now && !event.completed; // Simpan hanya event yang masih relevan
        })
      );

      console.log('Past/completed events successfully removed.');
    } catch (error) {
      console.error('Error removing past/completed events:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      {/* Success Notification */}
      {showSuccessNotification && (
        <View style={styles.successNotification}>
          <Text style={styles.successNotificationText}>
            Event successfully added to calendar ✅
          </Text>
        </View>
      )}

      {/* Day Selector */}
      <Text style={styles.subtitle}>
        Press which day to add to your calendar!
      </Text>
      <View style={styles.daySelector}>
        {days.map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day 
                ? styles.dayButtonSelected 
                : styles.dayButtonUnselected,
            ]}
            onPress={() => setSelectedDay(day)}>
            <Text style={selectedDay === day ? styles.dayTextSelected : styles.dayText}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Event List */}
      {!selectedDay && (
        <>
          <Text style={styles.sectionTitle}>Your Events This Week</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <FlatList
              data={events}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={[
                  styles.eventCard,
                  {borderLeftColor: getCategoryColor(item.type)}
                ]}>
                  <Text style={styles.eventCardText}>
                    {item.day} - {item.type}: {item.title}
                  </Text>
                  <Text style={styles.eventCardTime}>
                    {new Date(item.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(item.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                  <Text style={styles.eventCardStatus}>
                    Status: {item.completed ? 'Completed ✅' : 'Pending ⏳'}
                    {item.googleCalendarEventId && ' (Synced with Google)'}
                  </Text>
                </View>
              )}
            />
          )}
        </>
      )}

      {/* Event Form */}
      {selectedDay && (
        <>
          <View style={styles.atas}>
            <Text style={styles.sectionTitle}>{selectedDay}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.inputtitle}
            placeholder="Event title"
            value={eventTitle}
            onChangeText={setEventTitle}
          />

          {/* Time Pickers */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartPicker(true)}>
            <Text>
              {startTime ? startTime.toLocaleTimeString() : 'Select Start Time'}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                setShowStartPicker(false);
                if (date) setStartTime(date);
              }}
            />
          )}

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndPicker(true)}>
            <Text>
              {endTime ? endTime.toLocaleTimeString() : 'Select End Time'}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                setShowEndPicker(false);
                if (date) setEndTime(date);
              }}
            />
          )}

          {/* Event Type Selector */}
          <View style={styles.eventTypeSelector}>
            <View style={styles.containerdrop}>
              <Text style={styles.label}>Event Type</Text>
              <View style={styles.row}>
                <View style={styles.tombolrow}>
                  <Text style={styles.value}>{selectedOption}</Text>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setDropdownVisible(true)}>
                    <Image source={KananIcon} style={styles.navIcon} />
                  </TouchableOpacity>
                </View>
              </View>

              <Modal visible={dropdownVisible} transparent animationType="fade">
                <TouchableOpacity
                  style={styles.modalOverlay}
                  onPress={() => setDropdownVisible(false)}>
                  <View style={styles.dropdown}>
                    <TouchableOpacity onPress={() => handleSelect('Classes')}>
                      <Text style={styles.option}>Classes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleSelect('Workout')}>
                      <Text style={styles.option}>Workout</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>
        </>
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

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Workout': return '#3B82F6';
    case 'Classes': return '#10B981';
    default: return '#CBD5E1';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successNotification: {
    backgroundColor: '#E3FCEC',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  successNotificationText: {
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    minWidth: 40,
  },
  dayButtonSelected: {
    backgroundColor: '#49B1FB',
  },
  dayButtonUnselected: {
    backgroundColor: '#B7E1FF',
  },
  dayText: {
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  atas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  eventTypeSelector: {
    marginBottom: 20,
  },
  containerdrop: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    padding: 8,
    paddingBottom: 6,
    borderColor: '#000',
    borderRadius: 5,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
    marginRight: 10,
  },
  button: {},
  tombolrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    minWidth: 150,
  },
  option: {
    paddingVertical: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  inputtitle: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 32,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventCard: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  eventCardText: {
    color: '#333',
    fontWeight: 'bold',
  },
  eventCardTime: {
    color: '#666',
    marginTop: 4,
  },
  eventCardStatus: {
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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

export default CalendarMain;