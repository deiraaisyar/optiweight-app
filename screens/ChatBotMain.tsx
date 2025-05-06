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
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '@env';
import { firebaseConfig } from '../firebaseConfig';
import MicIcon from '../assets/images/mic_icon.webp';
import PlusIcon from '../assets/images/plus_icon.webp';
import BackIcon from '../assets/images/back_button.webp';

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// GEMINI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const ChatBotMain = ({ navigation }: any) => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            console.log('No user document found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('User not logged in');
        navigation.replace('Auth'); // Redirect ke layar login
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setChat((prev) => [...prev, `You: ${input}`]);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-002' });

      const prompt = `
You are a helpful AI assistant specialized in health.
User data:
${JSON.stringify(userData)}

Based on the above data, answer the question:
"${input}"
Only use relevant data, and if the question is general, provide a helpful general response.
      `;

      const result = await model.generateContent(prompt);
      const response = result?.response?.text() || 'No response from AI.';

      setChat((prev) => [...prev, `AI: ${response}`]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      setChat((prev) => [...prev, 'AI: Sorry, something went wrong.']);
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
        <Text style={styles.headerTitle}>AI Chatbox</Text>
      </View>

      {/* Chat Content */}
      <ScrollView contentContainerStyle={styles.chatBox}>
        {chat.map((msg, index) => (
          <Text key={index} style={styles.chatText}>{msg}</Text>
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
  chatText: { fontSize: 14, marginVertical: 4, fontFamily: 'Inter-Regular' },
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