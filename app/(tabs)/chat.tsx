import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, Camera, Mic, ArrowUp } from 'lucide-react-native';
import { askNutritionQuestion } from '@/services/ai-service';
import { useUser } from '@/hooks/user-store';
import { useNutrition } from '@/hooks/nutrition-store';
import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  recipeCard?: {
    title: string;
    description: string;
    calories: string;
    imageUrl: string;
  };
}

const QUICK_ACTIONS = [
  "Analyze my lunch",
  "Create a meal plan",
  "Is an avocado healthy?",
];

const chatKeyFor = (email?: string | null) => `chat_history:${email?.toLowerCase() ?? 'guest'}`;

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, authUser } = useUser();
  const { dailyNutrition } = useNutrition();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello! I'm NutriPal, your personal nutrition assistant. Ask me anything about food, calories, or meal plans to get started!`,
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

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

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
    } catch {
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

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animate = (dot: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate(dot1, 0);
      animate(dot2, 150);
      animate(dot3, 300);
    }, [dot1, dot2, dot3]);

    return (
      <View style={styles.typingContainer}>
        <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" opacity={0.8} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>NutriPal</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <MoreVertical size={24} color="#ffffff" opacity={0.8} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.isUser ? styles.userMessageRow : styles.aiMessageRow
              ]}
            >
              {!message.isUser && (
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTBoNXFyX_aMzR99zwqsPjj_08-iJrFLVwdXfmcHjaD97Qgh68ufTdmmx1s9CnEunvYjzXL22bl9C-51km3sjBibH99RLx2wczB-FSkHdw-4ws8BGI9xMzZlsGxNoXlgq4Moo6dgO3MeeeXL2xuQ-Fy4ALSkLDXxDja8ba19CLNxzmNhp9x6LqOeCdc4Y9CAJuPBX2y-NV8JT6cnogViXWLiIQohgSQFRcqgrV2UwLR8jyp9rPNKoiCZnNab_ZAgpXijRr4iMHMDHW' }}
                    style={styles.avatar}
                  />
                </View>
              )}

              <View style={[
                styles.messageContent,
                message.isUser ? styles.userMessageContent : styles.aiMessageContent
              ]}>
                <Text style={styles.messageLabel}>
                  {message.isUser ? 'You' : 'NutriPal'}
                </Text>
                
                <View style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessageBubble : styles.aiMessageBubble
                ]}>
                  <Text style={styles.messageText}>
                    {message.text}
                  </Text>
                </View>

                {message.recipeCard && (
                  <View style={styles.recipeCard}>
                    <Image 
                      source={{ uri: message.recipeCard.imageUrl }}
                      style={styles.recipeImage}
                    />
                    <View style={styles.recipeContent}>
                      <Text style={styles.recipeTitle}>{message.recipeCard.title}</Text>
                      <Text style={styles.recipeDescription}>{message.recipeCard.description}</Text>
                      <Text style={styles.recipeCalories}>{message.recipeCard.calories}</Text>
                      <TouchableOpacity style={styles.recipeButton}>
                        <Text style={styles.recipeButtonText}>Log this meal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {message.isUser && (
                <View style={styles.avatarContainer}>
                  <Image 
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdFMHRodOLZI3yTTEvgbXHl0_KG-gSgpoPg7Z9fJO2q2KTJJzdiYBAXP-VDKR1Eja8bC2Hq0-G18uuXIvYHp8Ojt00vuq6fMTzNN9if8e_DGadMhYyC2Q3xXEvAXQWP6SEw0dttc7sLgDnRLBkhhN2k4Q_yGeaMZZNX9R05NiiWYjNALD2apaiWLXehmTUvENLqQsCQI-mkvkVAtrIM1ET83L9ZBRCfBE0kq9hWbAC7UIwHzJBiagEvvhiQGQZ56WpoDbU5HAhrzdK' }}
                    style={styles.avatar}
                  />
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageRow, styles.aiMessageRow]}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB88P60yXhhIa8FujadOBFGQM_-l9j8NvAZQanO6dGx3kK57k3RoOQMaMmMTorm_SM7Qh4nOP0n5X_h73bknrMI8VvE30K07S_mAannxnyTrzkfLr4zrZilceLK_fQrl_zVFUmv2fqF5ZN7JBhPKGHrZFLKzRY3qhfHtbZqNp1J6O4S4mcBGaHmxD5g_2RY2FpqUkcz8j4DpqDuyG_X6IdIeaMo_NoINm-7bX14_y1R2zMh3OGP9MSw9DaWQuXbKCwt3XRsXVmg9Pdx' }}
                  style={styles.avatar}
                />
              </View>
              <View style={styles.messageContent}>
                <View style={styles.loadingBubble}>
                  <TypingIndicator />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
            contentContainerStyle={styles.quickActionsContent}
          >
            {QUICK_ACTIONS.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                <Text style={styles.quickActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Camera size={24} color="#ffffff" opacity={0.8} />
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about food or a meal..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
              >
                <ArrowUp size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.iconButton}>
              <Mic size={24} color="#ffffff" opacity={0.8} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111318',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.015,
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(59, 130, 246, 0.6)',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 24,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContent: {
    flex: 1,
    maxWidth: '75%',
    gap: 4,
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },
  aiMessageContent: {
    alignItems: 'flex-start',
  },
  messageLabel: {
    fontSize: 13,
    color: 'rgba(59, 130, 246, 0.6)',
    fontWeight: '400',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  userMessageBubble: {
    backgroundColor: '#3B82F6',
  },
  aiMessageBubble: {
    backgroundColor: '#1e232b',
  },
  messageText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  loadingBubble: {
    backgroundColor: '#1e232b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  recipeCard: {
    marginTop: 8,
    backgroundColor: '#1e232b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 150,
  },
  recipeContent: {
    padding: 16,
    gap: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.015,
  },
  recipeDescription: {
    fontSize: 14,
    color: 'rgba(59, 130, 246, 0.6)',
  },
  recipeCalories: {
    fontSize: 14,
    color: 'rgba(59, 130, 246, 0.6)',
  },
  recipeButton: {
    marginTop: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  recipeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActions: {
    marginBottom: 12,
  },
  quickActionsContent: {
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: '#1e232b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: 14,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1e232b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#1e232b',
    color: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingRight: 52,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});