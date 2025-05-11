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
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import KananIcon from '../assets/images/button_kanan.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import BackIcon from '../assets/images/back_button.webp';

const CalendarMain = ({navigation}: {navigation: any}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select');
  const handleSelect = option => {
    setSelectedOption(option);
    setDropdownVisible(false);
    setEventType(option === 'Classes' ? 'Classes' : 'Workout');
  };

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

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const getUser = async () => {
      const user = auth().currentUser;
      setCurrentUser(user);
      if (user) {
        fetchEvents(user.uid);
      }
    };
    getUser();
  }, []);

  const handleAddEvent = async () => {
    if (!currentUser || !selectedDay || !eventType || !eventTitle || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newEvent = {
      day: selectedDay,
      type: eventType,
      title: eventTitle,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      completed: false, // Important for streak logic
      userId: currentUser.uid // Connect event to user
    };

    try {
      setLoading(true);

      // Save to user-specific events collection
      const userEventsRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('events');

      const firestoreResponse = await userEventsRef.add(newEvent);

      // Add to Google Calendar (optional)
      try {
        const accessToken = await getAccessToken();
        await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              summary: eventTitle,
              start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Jakarta' },
              end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Jakarta' },
            }),
          }
        );
      } catch (googleError) {
        console.log('Google Calendar error:', googleError);
      }

      // Update local state
      setEvents(prev => [...prev, {id: firestoreResponse.id, ...newEvent}]);

      // Reset form
      setEventTitle('');
      setStartTime(null);
      setEndTime(null);
      setEventType(null);
      setSelectedOption('Select');

      // Show success
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
      Alert.alert('Success', 'Event added successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (userId: string) => {
    try {
      setLoading(true);
      const snapshot = await firestore()
        .collection('users')
        .doc(userId)
        .collection('events')
        .get();

      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token');
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
              selectedDay === day && styles.dayButtonSelected,
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
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: 40,
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayText: {
    color: '#555',
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