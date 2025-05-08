import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../types';

// Icon photo
const photoIcon = require('../assets/images/fill_photo.webp');

type UserDataScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'UserData'
>;

const UserDataScreen = () => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const navigation = useNavigation<UserDataScreenNavigationProp>();

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      navigation.replace('Auth');
      return;
    }
    checkUserData(user.uid);
  }, []);

  const checkUserData = async (userId: string) => {
    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists && userDoc.data()?.profileCompleted) {
        navigation.replace('Home');
      } else if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData?.fullName) setFullName(userData.fullName);
        if (userData?.preferredName) setPreferredName(userData.preferredName);
        if (userData?.weight) setWeight(userData.weight.toString());
        if (userData?.gender) setGender(userData.gender);
        if (userData?.dateOfBirth)
          setDateOfBirth(userData.dateOfBirth.toDate());
        if (userData?.photoUrl) setPhotoUrl(userData.photoUrl);
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

  const showDatepicker = () => setShowDatePicker(true);

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

  const handlePhotoUpload = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets || !result.assets.length) {
      return;
    }

    const file = result.assets[0];
    if (!file.uri) return;

    setUploading(true);
    setPhotoUri(file.uri);

    try {
      const user = auth().currentUser;
      if (!user) {
        Alert.alert('Error', 'No user is logged in');
        return;
      }

      const reference = storage().ref(`profile_photos/${user.uid}.jpg`);
      await reference.putFile(file.uri);
      const url = await reference.getDownloadURL();
      setPhotoUrl(url);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const saveUserData = async () => {
    if (!validateData()) return;

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'No user is logged in');
      return;
    }

    setLoading(true);

    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set(
          {
            fullName,
            preferredName,
            weight: Number(weight),
            gender,
            dateOfBirth,
            photoUrl: photoUrl || 'default_photo_url', // Gunakan URL default jika tidak ada foto
            profileCompleted: true,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      console.error('Error saving user data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fill in your personal details!</Text>

      {/* Upload Photo Section */}
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={handlePhotoUpload}>
          {uploading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : photoUri || photoUrl ? (
            <Image source={{ uri: photoUri || photoUrl }} style={styles.photo} />
          ) : (
            <Image source={photoIcon} style={styles.photo} />
          )}
        </TouchableOpacity>
        <Text style={styles.uploadText}>Upload your photo</Text>
      </View>

      {/* Full Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholder="Enter your full name"
        />
      </View>

      {/* Preferred Name Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Name</Text>
        <TextInput
          value={preferredName}
          onChangeText={setPreferredName}
          style={styles.input}
          placeholder="What should we call you?"
        />
      </View>

      {/* Date of Birth Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          onPress={showDatepicker}
          style={styles.datePickerButton}>
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

      {/* Weight Input */}
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

      {/* Gender Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {['male', 'female', 'other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderOption,
                gender === g && styles.selectedGender,
              ]}
              onPress={() => handleGenderSelection(g)}>
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.selectedGenderText,
                ]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Continue Button */}
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    resizeMode: 'cover',
  },
  uploadText: {
    marginTop: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default UserDataScreen;
