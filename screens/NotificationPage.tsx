import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Import icons for navbar
import HomeIcon from '../assets/images/home_icon.webp';
import BubbleChatIcon from '../assets/images/chat_bubble.webp';
import NotificationIcon from '../assets/images/notification_icon.webp';
import UserIcon from '../assets/images/user_icon.webp';

type ProfilePageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  type: 'workout' | 'reminder' | 'achievement';
};

const NotificationPage = () => {
  const navigation = useNavigation<ProfilePageNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);

  // Get user data
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            const data = doc.data();
            setUserName(data?.preferredName || data?.fullName || 'User');
          }
        });

      return unsubscribe;
    }
  }, []);

  // Format time difference
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
    return `${Math.floor(minutes/1440)}d ago`;
  };

  // Get notifications from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('notifications')
      .orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
        const notifs: Notification[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          const timestamp = data.timestamp?.toDate() || new Date();
          
          // Replace "Clive" with user's name in the message
          let message = data.message || '';
          message = message.replace(/Clive/g, userName);
          
          notifs.push({
            id: doc.id,
            title: data.title || 'Notification',
            message: message,
            time: formatTime(timestamp),
            timestamp: timestamp,
            type: data.type || 'reminder'
          });
        });
        setNotifications(notifs);
        setLoading(false);
      });

    return unsubscribe;
  }, [userName]);

  // Render one notification item
  const renderItem = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notifCard,
      item.type === 'achievement' && styles.achievementCard,
      item.type === 'reminder' && styles.reminderCard
    ]}>
      <Text style={styles.notifTitle}>{item.title.replace(/Clive/g, userName)}</Text>
      <Text style={styles.notifBody}>{item.message}</Text>
      <Text style={styles.notifTime}>{item.time}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notifList}
          showsVerticalScrollIndicator={false}
        />
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
          style={[styles.navItem, styles.activeNavItem]}
          onPress={() => navigation.navigate('Notification')}>
          <Image source={NotificationIcon} style={[styles.navIcon, styles.activeNavIcon]} />
          <Text style={[styles.navText, styles.activeNavText]}>Notification</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    marginBottom: 10,
    color: '#333',
  },
  notifList: {
    paddingHorizontal: 20,
    paddingBottom: 80, // Space for navbar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  notifCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  achievementCard: {
    backgroundColor: '#f0fff4',
    borderLeftColor: '#10b981',
  },
  reminderCard: {
    backgroundColor: '#fff7f0',
    borderLeftColor: '#f59e0b',
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  notifBody: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
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
  activeNavItem: {
    // Style for active nav item
  },
  navIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    opacity: 0.7,
  },
  activeNavIcon: {
    opacity: 1,
  },
  navText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'Inter-Regular',
  },
  activeNavText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

export default NotificationPage;