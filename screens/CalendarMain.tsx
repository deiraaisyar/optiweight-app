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

import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';
import KananIcon from '../assets/images/button_kanan.webp';

import {Picker} from '@react-native-picker/picker';

const CalendarMain = ({navigation}: {navigation: any}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Select');
  const handleSelect = option => {
    setSelectedOption(option);
    setDropdownVisible(false);
  };

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [eventType, setEventType] = useState<'Classes' | 'Workout' | null>(
    null,
  );
  const [eventTitle, setEventTitle] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [events, setEvents] = useState<
    {
      id: string;
      day: string;
      type: string;
      title: string;
      start: string;
      end: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false); // State untuk notifikasi sukses

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleAddEvent = async () => {
    if (!selectedDay || !eventType || !eventTitle || !startTime || !endTime) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newEvent = {
      day: selectedDay,
      type: eventType,
      title: eventTitle,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
    };

    try {
      setLoading(true);

      // Simpan ke Firestore
      const firestoreResponse = await firestore()
        .collection('events')
        .add(newEvent);

      // Dapatkan token OAuth 2.0
      const accessToken = await getAccessToken();

      // Tambahkan ke Google Calendar
      const googleResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`, // Sertakan token akses
          },
          body: JSON.stringify({
            summary: eventTitle,
            start: {
              dateTime: startTime.toISOString(),
              timeZone: 'Asia/Jakarta',
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'Asia/Jakarta',
            },
          }),
        },
      );

      const responseData = await googleResponse.json();
      console.log('Google Calendar Response:', responseData);

      if (!googleResponse.ok) {
        throw new Error(`Failed to save event: ${responseData.error.message}`);
      }

      // Tambahkan ke state lokal
      setEvents(prevEvents => [
        ...prevEvents,
        {id: firestoreResponse.id, ...newEvent},
      ]);

      // Reset form
      setEventTitle('');
      setStartTime(null);
      setEndTime(null);
      setEventType(null);

      // Tampilkan notifikasi sukses
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000); // Sembunyikan notifikasi setelah 3 detik

      Alert.alert('Success', 'Event added successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const firestoreEvents = await firestore().collection('events').get();
      const eventsFromFirestore = firestoreEvents.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventsFromFirestore);
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
      console.log('Access Token:', tokens.accessToken);
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      {/* Notifikasi Sukses */}
      {showSuccessNotification && (
        <View style={styles.successNotification}>
          <Text style={styles.successNotificationText}>
            Event successfully added to calendar ✅
          </Text>
        </View>
      )}

      {/* Day Selector */}
      <Text style={styles.title}>Calendar</Text>
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
            <Text
              style={
                selectedDay === day ? styles.dayTextSelected : styles.dayText
              }>
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
              data={events} // Tampilkan semua event di minggu ini
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View style={styles.eventCard}>
                  <Text style={styles.eventCardText}>
                    {item.day} - {item.type}: {item.title} ({item.start} -{' '}
                    {item.end})
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

          {/* Start Time Picker */}
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

          {/* End Time Picker */}
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

          <View style={styles.eventTypeSelector}>
            <View style={styles.containerdrop}>
              <Text style={styles.label}>Calendar</Text>
              <View style={styles.row}>
                <View style={styles.tombolrow}>
                  <Text style={styles.value}>{selectedOption}</Text>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setDropdownVisible(true)}>
                    {/* <Text style={styles.buttonText}>Select Event Type</Text> */}
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
          onPress={() => navigation.navigate('Library')}>
          <Image source={BookOpenIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Library</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Notification')}>
          <Image source={NotificationIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Notification</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}>
          <Image source={UserIcon} style={styles.navIcon} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getCategoryColor = category => {
  switch (category) {
    case 'Workout':
      return '#3B82F6'; // blue
    case 'Class':
      return '#10B981'; // green
    case 'Others':
      return '#F59E0B'; // amber
    default:
      return '#CBD5E1'; // gray
  }
};

const styles = StyleSheet.create({
  atas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 10,
  },

  picker: {
    height: 50,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  eventTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  eventTypeButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  eventTypeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  eventTypeText: {
    color: '#555',
  },
  eventTypeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
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
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 32,
    alignItems: 'center',
    // marginBottom: 20,
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
  },
  eventCardText: {
    color: '#333',
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

  containerdrop: {
    // padding: 20,
    // marginTop: 50,

    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    borderWidth: 1,
    padding: 8,
    paddingBottom: 6,
    // borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
    marginTop: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 10,
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
    marginRight: 10,
  },
  button: {
    // backgroundColor: '#4B7BE5',
    // paddingHorizontal: 10,
    // paddingVertical: 8,
    // borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
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
  tombolrow: {
    flexDirection: 'row',
    // alignItems:
  },
});

export default CalendarMain;
