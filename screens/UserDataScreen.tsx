import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

// Define RootStackParamList for navigation
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  UserData: undefined;
};

const UserDataScreen = () => {
  const [fullName, setFullName] = useState<string>('');
  const [preferredName, setPreferredName] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  useEffect(() => {
    // Check if user is logged in
    const user = auth().currentUser;
    if (!user) {
      // If no user is logged in, redirect to Auth screen
      navigation.replace('Auth');
      return;
    }
    
    // Check if user data already exists
    checkUserData(user.uid);
  }, []);
  
  const checkUserData = async (userId: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      
      if (userDoc.exists && userDoc.data()?.profileCompleted) {
        // User profile is already complete, redirect to Home
        navigation.replace('Home');
      } else if (userDoc.exists) {
        // Load existing data if available
        const userData = userDoc.data();
        if (userData?.fullName) setFullName(userData.fullName);
        if (userData?.preferredName) setPreferredName(userData.preferredName);
        if (userData?.weight) setWeight(userData.weight.toString());
        if (userData?.gender) setGender(userData.gender);
        if (userData?.dateOfBirth) setDateOfBirth(userData.dateOfBirth.toDate());
      }
    } catch (error) {
      console.error('Error checking user data:', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleGenderSelection = (selectedGender: string) => {
    setGender(selectedGender);
  };

  const validateData = () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!preferredName.trim()) {
      Alert.alert('Error', 'Please enter your preferred name');
      return false;
    }
    if (!weight.trim() || isNaN(Number(weight))) {
      Alert.alert('Error', 'Please enter a valid weight');
      return false;
    }
    if (!gender) {
      Alert.alert('Error', 'Please select your gender');
      return false;
    }
    return true;
  };

  const saveUserData = async () => {
    if (!validateData()) {
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is logged in');
      return;
    }

    setLoading(true);

    try {
      await firestore().collection('users').doc(user.uid).set({
        fullName,
        preferredName,
        weight: Number(weight),
        gender,
        dateOfBirth,
        profileCompleted: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, {merge: true});

      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      setLoading(false);
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>
        Please provide your information to continue
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Name</Text>
        <TextInput
          value={preferredName}
          onChangeText={setPreferredName}
          style={styles.input}
          placeholder="What should we call you?"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity onPress={showDatepicker} style={styles.datePickerButton}>
          <Text style={styles.datePickerButtonText}>
            {formatDate(dateOfBirth)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Weight (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          style={styles.input}
          placeholder="Enter your weight in kg"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'male' && styles.selectedGender,
            ]}
            onPress={() => handleGenderSelection('male')}>
            <Text
              style={[
                styles.genderText,
                gender === 'male' && styles.selectedGenderText,
              ]}>
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'female' && styles.selectedGender,
            ]}
            onPress={() => handleGenderSelection('female')}>
            <Text
              style={[
                styles.genderText,
                gender === 'female' && styles.selectedGenderText,
              ]}>
              Female
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderOption,
              gender === 'other' && styles.selectedGender,
            ]}
            onPress={() => handleGenderSelection('other')}>
            <Text
              style={[
                styles.genderText,
                gender === 'other' && styles.selectedGenderText,
              ]}>
              Other
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={saveUserData}
        disabled={loading}>
        <Text style={styles.continueButtonText}>
          {loading ? 'Saving...' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedGender: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 16,
  },
  selectedGenderText: {
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserDataScreen;