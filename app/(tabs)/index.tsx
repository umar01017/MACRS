import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'macrs';
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! I am MACRS. How can I help you today?', sender: 'macrs' }
  ]);
  const [inputText, setInputText] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Determine the correct WebSocket URL based on platform.
    // If running on an Android emulator: 10.0.2.2 maps to computer's localhost
    // Otherwise use localhost.
    const baseUrl = Platform.OS === 'android' ? '10.0.2.2' : '192.168.100.114';
    const sessionId = "mobile-testing-" + Date.now();
    const wsUrl = `ws://${baseUrl}:8000/ws/chat/${sessionId}`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to MACRS WebSocket backend");
      setMessages(prev => [...prev, { id: Date.now().toString(), text: '✅ Connected to MACRS Backend!', sender: 'macrs' }]);
    };

    ws.current.onmessage = (e) => {
      // Create a new message bubble for each incoming status/response from the backend
      const responseMessage: Message = {
        id: Date.now().toString() + Math.random().toString(),
        text: e.data,
        sender: 'macrs',
      };
      setMessages((prev) => [...prev, responseMessage]);
    };

    ws.current.onerror = (e) => {
      console.log("WebSocket error", e);
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
      setMessages(prev => [...prev, { id: Date.now().toString(), text: '❌ Disconnected from MACRS Backend.', sender: 'macrs' }]);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Send the text directly to the Python WebSocket endpoint
      ws.current.send(newUserMessage.text);
    } else {
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + 'err',
        text: "Error: Not connected to the backend. Please make sure your Python server is running on port 8000.",
        sender: 'macrs',
      }]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.macrsBubble]}>
        <ThemedText style={{ color: isUser ? '#fff' : '#000' }}>{item.text}</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Chat with MACRS</ThemedText>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message to MACRS..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    padding: 20,
    gap: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#0a7ea4',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  macrsBubble: {
    backgroundColor: '#e1e1e1',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginRight: 10,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
