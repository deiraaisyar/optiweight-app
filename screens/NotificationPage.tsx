import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

// Import ikon untuk navbar
import HomeIcon from '../assets/images/home_icon.webp';
import BookOpenIcon from '../assets/images/book_icon.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';

type ProfilePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type Notification = {
  id: string;
  title: string;
  body: string;
};

const NotificationPage = () => {
  const navigation = useNavigation<ProfilePageNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simpan notifikasi yang diterima ke Firestore
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const newNotif = {
        title: remoteMessage.notification?.title || 'No Title',
        body: remoteMessage.notification?.body || 'No Message',
        timestamp: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('notifications').add(newNotif);
    });

    return unsubscribe;
  }, []);

  // Ambil notifikasi dari Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .onSnapshot(querySnapshot => {
        const notifs: Notification[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          notifs.push({
            id: doc.id,
            title: data.title,
            body: data.body,
          });
        });
        setNotifications(notifs);
      });

    return () => unsubscribe();
  }, []);

  // Render satu notifikasi
  const renderItem = ({ item }: { item: Notification }) => (
    <View style={styles.notifCard}>
      <Text style={styles.notifTitle}>{item.title}</Text>
      <Text style={styles.notifBody}>{item.body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notifList}
      />

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
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  notifList: {
    paddingHorizontal: 20,
    paddingBottom: 80, // biar nggak ketutupan navbar
  },
  notifCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
    color: '#555',
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

export default NotificationPage;
