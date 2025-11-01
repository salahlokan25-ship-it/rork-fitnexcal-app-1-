import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Send, Info } from 'lucide-react-native';
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
  "What's a good snack?",
  "Log my last meal",
  "Calories in an apple?",
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
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'AI Coach',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerRight: () => (
            <TouchableOpacity style={dynamic.headerButton}>
              <Info size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView 
        style={dynamic.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                dynamic.messageRow,
                message.isUser ? dynamic.userMessageRow : dynamic.aiMessageRow
              ]}
            >
              {!message.isUser && (
                <View style={dynamic.avatarContainer}>
                  <View style={dynamic.aiAvatar}>
                    <Text style={dynamic.aiAvatarText}>🤖</Text>
                  </View>
                </View>
              )}
              
              <View style={dynamic.messageContent}>
                <Text style={dynamic.messageSender}>
                  {message.isUser ? 'You' : 'AI Coach'}
                </Text>
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

              {message.isUser && (
                <View style={dynamic.avatarContainer}>
                  <View style={dynamic.userAvatar}>
                    <Text style={dynamic.userAvatarText}>👤</Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={dynamic.messageRow}>
              <View style={dynamic.avatarContainer}>
                <View style={dynamic.aiAvatar}>
                  <Text style={dynamic.aiAvatarText}>🤖</Text>
                </View>
              </View>
              <View style={dynamic.loadingBubble}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={dynamic.inputWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={dynamic.quickRepliesScroll}
            contentContainerStyle={dynamic.quickRepliesContent}
          >
            {QUICK_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={dynamic.quickReplyChip}
                onPress={() => handleQuickQuestion(question)}
              >
                <Text style={dynamic.quickReplyText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={dynamic.inputContainer}>
            <TextInput
              style={dynamic.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about nutrition..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[dynamic.sendButton, (!inputText.trim() || isLoading) && dynamic.sendButtonDisabled]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
            >
              <Send size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createAnimation(dot1, 0),
      createAnimation(dot2, 200),
      createAnimation(dot3, 400),
    ]).start();
  }, []);

  const opacity1 = dot1.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const opacity2 = dot2.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const opacity3 = dot3.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });

  return (
    <View style={styles.typingIndicator}>
      <Animated.View style={[styles.typingDot, { opacity: opacity1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: opacity2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: opacity3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
});

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  headerButton: {
    padding: 8,
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
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarText: {
    fontSize: 20,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
  },
  messageSender: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  userMessageBubble: {
    backgroundColor: '#137fec',
    borderBottomRightRadius: 4,
  },
  aiMessageBubble: {
    backgroundColor: Theme.colors.surface,
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
    color: Theme.colors.text,
  },
  loadingBubble: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
  },
  inputWrapper: {
    backgroundColor: Theme.colors.background,
  },
  quickRepliesScroll: {
    maxHeight: 48,
  },
  quickRepliesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  quickReplyChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReplyText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: Theme.colors.surface,
    color: Theme.colors.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#137fec',
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.border,
  },
});