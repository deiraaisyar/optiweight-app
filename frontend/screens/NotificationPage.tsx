import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  read: boolean;
};

const NotificationPage = () => {
  const navigation = useNavigation<ProfilePageNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
  const fetchNotifications = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .get();

      const notifs: Notification[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate() || new Date();
        
        let message = data.message || '';
        message = message.replace(/Clive/g, userName);
        
        notifs.push({
          id: doc.id,
          title: data.title || 'Notification',
          message: message,
          time: formatTime(timestamp),
          timestamp: timestamp,
          type: data.type || 'reminder',
          read: data.read || false
        });
      });
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await firestore().collection('notifications').doc(id).update({
        read: true
      });
      setNotifications(prev => prev.map(n => 
        n.id === id ? {...n, read: true} : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Render one notification item
  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      onPress={() => markAsRead(item.id)}
      style={[
        styles.notifCard,
        item.type === 'achievement' && styles.achievementCard,
        item.type === 'workout' && styles.workoutCard,
        item.type === 'reminder' && styles.reminderCard,
        item.read && styles.readCard
      ]}
    >
      <View style={styles.notifHeader}>
        {item.type === 'achievement' && (
          <Icon name="emoji-events" size={20} color="#10b981" style={styles.notifIcon} />
        )}
        {item.type === 'workout' && (
          <Icon name="fitness-center" size={20} color="#3b82f6" style={styles.notifIcon} />
        )}
        {item.type === 'reminder' && (
          <Icon name="notifications" size={20} color="#f59e0b" style={styles.notifIcon} />
        )}
        <Text style={styles.notifTitle}>{item.title.replace(/Clive/g, userName)}</Text>
        {!item.read && <View style={styles.unreadBadge} />}
      </View>
      <Text style={styles.notifBody}>{item.message}</Text>
      <Text style={styles.notifTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  const groupNotificationsByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: {[key: string]: Notification[]} = {
      'Today': [],
      'Yesterday': [],
      'Older': []
    };
    
    notifications.forEach(notif => {
      const notifDate = new Date(notif.timestamp);
      notifDate.setHours(0, 0, 0, 0);
      
      if (notifDate.getTime() === today.getTime()) {
        groups['Today'].push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups['Yesterday'].push(notif);
      } else {
        groups['Older'].push(notif);
      }
    });
    
    return groups;
  };

  const renderSection = (title: string, data: Notification[]) => {
    if (data.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {data.map(item => (
          <View key={item.id}>
            {renderItem({item})}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const groupedNotifications = groupNotificationsByDate();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => setRefreshing(true)}>
          <Icon name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>We'll notify you when something arrives</Text>
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          keyExtractor={() => 'sections'}
          contentContainerStyle={styles.notifList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
            />
          }
          ListHeaderComponent={
            <>
              {renderSection('Today', groupedNotifications['Today'])}
              {renderSection('Yesterday', groupedNotifications['Yesterday'])}
              {renderSection('Older', groupedNotifications['Older'])}
            </>
          }
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
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  notifList: {
    paddingBottom: 80, // Space for navbar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
  },
  notifCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  readCard: {
    opacity: 0.8,
    backgroundColor: '#f8fafc',
  },
  achievementCard: {
    borderLeftColor: '#10b981',
  },
  workoutCard: {
    borderLeftColor: '#3b82f6',
  },
  reminderCard: {
    borderLeftColor: '#f59e0b',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifIcon: {
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  notifBody: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  notifTime: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
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
    color: '#64748b',
  },
  activeNavText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

export default NotificationPage;