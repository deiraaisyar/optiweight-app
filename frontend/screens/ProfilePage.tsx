import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import BackIcon from '../assets/images/button_revised.webp';

// Define navigation type
type ProfileScreenNavigationProp = NativeStackNavigationProp<{
  Home: undefined;
  EditProfile: undefined;
  Auth: undefined;
}>;

// User data type definition
type UserData = {
  fullName: string;
  preferredName: string;
  dateOfBirth: any;
  weight: number;
  height?: number;
  gender: string;
  profileCompleted: boolean;
};

const ProfileScreen = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editedData, setEditedData] = useState<Partial<UserData>>({});
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://192.168.0.108:5000/api/users/${auth().currentUser?.uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSave = async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;

    try {
      await firestore().collection('users').doc(currentUser.uid).update(editedData);

      setUserData({
        ...userData!,
        ...editedData,
      });

      setEditedData({});
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update profile data. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : 'Not specified';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image source={BackIcon} style={styles.navIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData?.preferredName ? userData.preferredName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{userData?.preferredName || 'User'}</Text>
          <Text style={styles.userEmail}>{auth().currentUser?.email}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full Name</Text>
          <TextInput
            value={editedData.fullName ?? userData?.fullName ?? ''}
            onChangeText={(text) => setEditedData({ ...editedData, fullName: text })}
            style={styles.input}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Preferred Name</Text>
          <TextInput
            value={editedData.preferredName ?? userData?.preferredName ?? ''}
            onChangeText={(text) => setEditedData({ ...editedData, preferredName: text })}
            style={styles.input}
            placeholder="Enter your preferred name"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          <TextInput
            value={
              editedData.dateOfBirth
                ? formatDate(new Date(editedData.dateOfBirth))
                : userData?.dateOfBirth
                ? formatDate(userData.dateOfBirth)
                : ''
            }
            onChangeText={(text) => setEditedData({ ...editedData, dateOfBirth: new Date(text) })}
            style={styles.input}
            placeholder="Enter your date of birth (DD/MM/YYYY)"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gender</Text>
          <TextInput
            value={editedData.gender ?? userData?.gender ?? ''}
            onChangeText={(text) => setEditedData({ ...editedData, gender: text })}
            style={styles.input}
            placeholder="Enter your gender"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Weight</Text>
          <TextInput
            value={editedData.weight?.toString() ?? userData?.weight?.toString() ?? ''}
            onChangeText={(text) => setEditedData({ ...editedData, weight: Number(text) })}
            style={styles.input}
            placeholder="Enter your weight in kg"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Height</Text>
          <TextInput
            value={editedData.height?.toString() ?? userData?.height?.toString() ?? ''}
            onChangeText={(text) => setEditedData({ ...editedData, height: Number(text) })}
            style={styles.input}
            placeholder="Enter your height in cm"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 70,
  },
  profileSection: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
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
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    marginTop: 4,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    alignSelf: 'center', // Pastikan tombol berada di tengah
    marginTop: 20,
    marginBottom: 40, // Tambahkan margin bawah untuk ruang kosong
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navIcon: {
    width: 33,
    height: 33,
  },
  scrollContent: {
    paddingBottom: 25, // Tambahkan padding bawah untuk ruang kosong
  },
});

export default ProfileScreen;