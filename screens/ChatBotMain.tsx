import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import MicIcon from '../assets/images/mic_icon.webp';
import PlusIcon from '../assets/images/plus_icon.webp';
import BackIcon from '../assets/images/back_button.webp';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Tambahkan impor untuk Firebase Auth

type ChatBotMainNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatBotMain'>;

type ChatMessage = {
  sender: 'Me' | 'Fit Buddy';
  message: string;
};

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const ChatBotMain = ({ navigation }: { navigation: ChatBotMainNavigationProp }) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const getData = async () => {
    try {
      // Ambil pengguna yang sedang login
      const user = auth().currentUser;

      if (user) {
        // Ambil dokumen pengguna berdasarkan UID
        const userDoc = await firestore().collection('users').doc(user.uid).get();

        if (userDoc.exists) {
          console.log('User data fetched:', userDoc.data());
          setUserData(userDoc.data());
        } else {
          console.log('No user document found for UID:', user.uid);
        }
      } else {
        console.log('No user is logged in');
        navigation.navigate('Auth'); // Redirect ke halaman login jika tidak ada pengguna login
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error);
    } finally {
      setLoadingUser(false); // Set loading selesai
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { sender: 'Me', message: input };
    setChat((prev) => [...prev, userMessage]);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });

      const prompt = `
You are a helpful AI assistant specialized in health called Fit Buddy.
User data:
${JSON.stringify(userData)}

Based on the above data, answer the question:
"${input}"
Only use relevant data, and if the question is general, provide a helpful general response. In every answer, include a greeting and a closing statement. Please give recommendations based on the user's data.
      `;

      const result = await model.generateContent(prompt);
      const response = result?.response?.text() || 'No response from AI.';
      const aiMessage: ChatMessage = { sender: 'Fit Buddy', message: response };

      setChat((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      setChat((prev) => [
        ...prev,
        { sender: 'Fit Buddy', message: 'Sorry, something went wrong.' },
      ]);
    }

    setInput('');
  };

  if (loadingUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.greetingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={BackIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fit Buddy</Text>
      </View>

      {/* Chat Content */}
      <ScrollView contentContainerStyle={styles.chatBox}>
        {chat.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.sender === 'Me' ? styles.rightAlign : styles.leftAlign,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'Me' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.senderText}>{msg.sender}</Text>
              <Text style={styles.messageText}>{msg.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Greeting */}
      <Text style={styles.greetingText}>
        Hello {userData?.preferredName || 'User'}! How may I assist you?
      </Text>

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.iconButton}>
          <Image source={PlusIcon} style={styles.iconImage} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Ask anything"
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
          <Image source={MicIcon} style={styles.iconImage} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
  },
  chatBox: { flexGrow: 1, paddingBottom: 20 },
  messageContainer: {
    marginVertical: 6,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  leftAlign: {
    justifyContent: 'flex-start',
  },
  rightAlign: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: '#F0F0F0',
    borderTopLeftRadius: 0,
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 0,
  },
  senderText: {
    fontSize: 10,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Inter-Regular',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, paddingHorizontal: 8, fontFamily: 'Inter-Regular' },
  iconButton: { padding: 6 },
  iconImage: { width: 24, height: 24, resizeMode: 'contain' },
});

export default ChatBotMain;