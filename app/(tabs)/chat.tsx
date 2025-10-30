import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User } from 'lucide-react-native';
import { askNutritionQuestion } from '@/services/ai-service';
import { useUser } from '@/hooks/user-store';
import { useNutrition } from '@/hooks/nutrition-store';
import { useTheme } from '@/hooks/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "What should I eat for breakfast?",
  "How can I increase my protein intake?",
  "What are healthy snack options?",
  "How do I meal prep effectively?",
];

const chatKeyFor = (email?: string | null) => `chat_history:${email?.toLowerCase() ?? 'guest'}`;

export default function ChatScreen() {
  const { theme } = useTheme();
  const { user, authUser } = useUser();
  const { dailyNutrition } = useNutrition();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${user?.name || 'there'}! I'm your AI nutrition assistant. I can help you with meal planning, nutrition advice, and answer any food-related questions you have. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadChat = async () => {
      try {
        const key = chatKeyFor(authUser?.email ?? user?.id ?? user?.name ?? undefined);
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as { id: string; text: string; isUser: boolean; timestamp: string }[];
          const restored: Message[] = parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
          if (restored.length > 0) {
            setMessages(restored);
          }
        }
      } catch (e) {
        console.error('[Chat] loadChat error', e);
      }
    };
    void loadChat();
  }, [authUser?.email, user?.id, user?.name]);

  useEffect(() => {
    const persist = async () => {
      try {
        const key = chatKeyFor(authUser?.email ?? user?.id ?? user?.name ?? undefined);
        const serializable = messages.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() }));
        await AsyncStorage.setItem(key, JSON.stringify(serializable));
      } catch (e) {
        console.error('[Chat] persistChat error', e);
      }
    };
    void persist();
  }, [messages, authUser?.email, user?.id, user?.name]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const userContext = user && dailyNutrition ? {
        goal: user.goal,
        goal_calories: user.goal_calories,
        current_calories: dailyNutrition.total_calories,
      } : undefined;

      const response = await askNutritionQuestion(text, userContext);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const dynamic = stylesWithTheme(theme);

  return (
    <SafeAreaView style={dynamic.container}>
      <View style={dynamic.header}>
        <Bot size={24} color="#007AFF" />
        <Text style={dynamic.title}>Nutrition Assistant</Text>
      </View>

      <KeyboardAvoidingView 
        style={dynamic.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={dynamic.messagesContainer}
          contentContainerStyle={dynamic.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                dynamic.messageContainer,
                message.isUser ? dynamic.userMessageContainer : dynamic.aiMessageContainer
              ]}
            >
              <View style={dynamic.messageHeader}>
                {message.isUser ? (
                  <User size={16} color="#007AFF" />
                ) : (
                  <Bot size={16} color="#007AFF" />
                )}
                <Text style={dynamic.messageTime}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              
              <View style={[
                dynamic.messageBubble,
                message.isUser ? dynamic.userMessageBubble : dynamic.aiMessageBubble
              ]}>
                <Text style={[
                  dynamic.messageText,
                  message.isUser ? dynamic.userMessageText : dynamic.aiMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={dynamic.loadingContainer}>
              <View style={dynamic.loadingBubble}>
                <Text style={dynamic.loadingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <View style={dynamic.quickQuestionsContainer}>
              <Text style={dynamic.quickQuestionsTitle}>Quick Questions:</Text>
              {QUICK_QUESTIONS.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={dynamic.quickQuestionButton}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={dynamic.quickQuestionText}>{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={dynamic.inputContainer}>
          <TextInput
            style={dynamic.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about nutrition..."
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[dynamic.sendButton, (!inputText.trim() || isLoading) && dynamic.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={(!inputText.trim() || isLoading) ? '#ccc' : '#007AFF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageTime: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    marginTop: 20,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  quickQuestionButton: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickQuestionText: {
    fontSize: 14,
    color: '#007AFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: Theme.colors.accent,
    color: Theme.colors.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  sendButtonDisabled: {
    backgroundColor: '#f5f5f5',
  },
});