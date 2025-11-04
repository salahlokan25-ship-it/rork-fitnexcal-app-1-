import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { Smile, Mic, AudioLines, Square, Leaf, Angry, Meh, Frown, Plus, ArrowLeft } from 'lucide-react-native';
import { useMood } from '@/hooks/mood-store';
import { useNutrition } from '@/hooks/nutrition-store';
import { router } from 'expo-router';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import type { MoodEmotion } from '@/types/mood';
import type { FoodItem, MealEntry } from '@/types/nutrition';
import { analyzeFoodFromText } from '@/services/ai-service';

export default function MindScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { logMood, getNudges } = useMood();
  const { addMeal } = useNutrition();

  const [moodModal, setMoodModal] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<MoodEmotion>('neutral');
  const [intensity, setIntensity] = useState<string>('5');
  const [moodNote, setMoodNote] = useState<string>('');

  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [sttError, setSttError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisFoods, setAnalysisFoods] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealEntry['meal_type']>('lunch');

  const [showMoodReport, setShowMoodReport] = useState<boolean>(false);
  const [reportFoods, setReportFoods] = useState<FoodItem[]>([]);
  const [reportText, setReportText] = useState<string>('');
  const [lastSavedEmotion, setLastSavedEmotion] = useState<MoodEmotion | null>(null);

  const mediaRecorderRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const dynamic = stylesWithTheme(theme);

  const buildEmotionFoods = useCallback((emotion: MoodEmotion): FoodItem[] => {
    const base: FoodItem[] = [];
    const mk = (id: string, name: string, calories: number, protein: number, carbs: number, fat: number, serving: string, image: string): FoodItem => ({ id, name, calories, protein, carbs, fat, serving_size: serving, image_url: image });
    if (emotion === 'stress' || emotion === 'anxious') {
      base.push(
        mk('tea_camomile', 'Chamomile tea', 2, 0, 0, 0, '1 cup', 'https://images.unsplash.com/photo-1505575967455-40e256f73376?w=300&h=200&fit=crop'),
        mk('yogurt_berries', 'Greek yogurt + berries', 160, 17, 18, 2, '170g + 50g', 'https://images.unsplash.com/photo-1514517521153-1be72277b32e?w=300&h=200&fit=crop'),
        mk('banana_pbf', 'Banana + peanut butter', 210, 6, 27, 9, '1 banana + 1 tbsp', 'https://images.unsplash.com/photo-1571772805064-207c8435df79?w=300&h=200&fit=crop')
      );
    }
    if (emotion === 'boredom' || emotion === 'neutral') {
      base.push(
        mk('carrots_hummus', 'Carrots + hummus', 140, 5, 16, 7, '100g + 2 tbsp', 'https://images.unsplash.com/photo-1604908554023-17c3432f859d?w=300&h=200&fit=crop'),
        mk('apple_peanut', 'Apple + peanut butter', 195, 5, 24, 9, '1 apple + 1 tbsp', 'https://images.unsplash.com/photo-1541690217668-7d49de27ef39?w=300&h=200&fit=crop')
      );
    }
    if (emotion === 'sad' || emotion === 'tired') {
      base.push(
        mk('oatmeal', 'Warm oatmeal', 220, 8, 36, 4, '1 cup cooked', 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=300&h=200&fit=crop'),
        mk('dark_choc', '85% dark chocolate', 170, 3, 13, 12, '30g', 'https://images.unsplash.com/photo-1497051788611-2c64812349d3?w=300&h=200&fit=crop'),
        mk('nuts', 'Mixed nuts small handful', 180, 6, 6, 15, '28g', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop')
      );
    }
    if (emotion === 'happy') {
      base.push(
        mk('smoothie', 'Protein smoothie', 250, 25, 28, 5, '350 ml', 'https://images.unsplash.com/photo-1570158268183-d296b2892211?w=300&h=200&fit=crop')
      );
    }
    return base;
  }, []);

  const buildMoodReport = useCallback((emotion: MoodEmotion, intensityVal: number): string => {
    const map: Record<MoodEmotion, string> = {
      stress: 'You reported feeling stressed. High stress can increase cravings, especially at night.',
      boredom: 'You reported boredom. Boredom often drives snacking without true hunger.',
      sad: 'You reported feeling sad. Comfort foods can be tempting when mood is low.',
      anxious: 'You reported feeling anxious. Anxiety can raise urge for quick energy snacks.',
      tired: 'You reported feeling tired. Low sleep increases hunger hormones and cravings.',
      happy: 'You reported feeling happy. Great time to choose balanced snacks that keep momentum.',
      neutral: 'You reported neutral mood. Maintain steady, balanced choices.',
    };
    const intensityMsg = intensityVal >= 7
      ? 'Intensity is high. Prioritize calming, protein-forward snacks and short breaks.'
      : intensityVal <= 3
        ? 'Intensity is mild. Light structure and pre-planned snacks should be enough.'
        : 'Moderate intensity. Use simple routines and convenient options to stay on track.';
    return `${map[emotion]} ${intensityMsg}`;
  }, []);

  const startRecordingWeb = useCallback(async () => {
    if (Platform.OS !== 'web') {
      setShowVoiceModal(true);
      return;
    }
    try {
      setSttError(null);
      const stream = await (navigator.mediaDevices as any)?.getUserMedia?.({ audio: true });
      if (!stream) {
        setSttError('Microphone not available');
        return;
      }
      streamRef.current = stream;
      const MediaRecorderCtor: any = (window as any).MediaRecorder;
      if (!MediaRecorderCtor) {
        setSttError('MediaRecorder is not supported in this browser');
        return;
      }
      const mediaRecorder = new MediaRecorderCtor(stream);
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e: any) => {
        if (e?.data?.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
          formData.append('audio', file as any);
          const resp = await fetch('https://toolkit.rork.com/stt/transcribe/', {
            method: 'POST',
            body: formData,
          });
          const data = await resp.json();
          if (!resp.ok) {
            setSttError(data?.error || 'Transcription failed');
            return;
          }
          setTranscript(String(data?.text ?? ''));
          setShowVoiceModal(true);
        } catch (err) {
          console.log('[STT] Upload error', err);
          setSttError('Upload failed');
        } finally {
          (streamRef.current as MediaStream | null)?.getTracks?.().forEach((t: any) => t.stop?.());
          streamRef.current = null;
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      console.log('[STT] Recording started');
    } catch (e) {
      console.log('[STT] start error', e);
      setSttError('Microphone permission denied or not available');
    }
  }, []);

  const stopRecordingWeb = useCallback(() => {
    if (Platform.OS !== 'web') return;
    try {
      mediaRecorderRef.current?.stop?.();
      setIsRecording(false);
      console.log('[STT] Recording stopped');
    } catch (e) {
      console.log('[STT] stop error', e);
    }
  }, []);

  const handleAnalyzeTranscript = useCallback(async () => {
    try {
      setAnalysisError(null);
      setAnalysisLoading(true);
      const desc = transcript.trim();
      if (!desc) {
        setAnalysisError('Please provide a short description of what you ate.');
        return;
      }
      const result = await analyzeFoodFromText(desc);
      const foods: FoodItem[] = (result.foods || []).map((f: any, idx: number) => ({
        id: `ai_text_${Date.now()}_${idx}`,
        name: String(f.name),
        calories: Number(f.calories ?? 0),
        protein: Number(f.protein ?? 0),
        carbs: Number(f.carbs ?? 0),
        fat: Number(f.fat ?? 0),
        serving_size: String(f.serving_size ?? '1 serving'),
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
      }));
      setAnalysisFoods(foods);
    } catch (e) {
      console.log('[AI Analyze] error', e);
      setAnalysisError('Could not analyze. Please try again.');
    } finally {
      setAnalysisLoading(false);
    }
  }, [transcript]);

  const handleAddAllAnalyzed = useCallback(async () => {
    try {
      for (const f of analysisFoods) {
        await addMeal(f, 1, selectedMealType);
      }
      setShowVoiceModal(false);
      setAnalysisFoods([]);
      setTranscript('');
    } catch (e) {
      console.log('[AI AddAll] error', e);
    }
  }, [analysisFoods, addMeal, selectedMealType]);

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="mind-scroll">
        <AnimatedFadeIn delay={40}>
          <View style={dynamic.topHeaderRow}>
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) router.back();
                else router.replace('/');
              }}
              style={dynamic.headerBtn}
              testID="mind-back"
            >
              <ArrowLeft size={22} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={dynamic.headerTitle}>MindFull Mind</Text>
            <View style={dynamic.headerBtn} />
          </View>
          <Text style={dynamic.headerSubtitle}>Connect with your mind and body.</Text>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={100}>
          <TouchableOpacity 
            style={dynamic.tile}
            onPress={() => setMoodModal(true)}
            testID="mood-card"
          >
            <Text style={dynamic.tileTitle}>Log Mood</Text>
            <Text style={dynamic.tileSubtitle}>Track emotions and eating patterns.</Text>
            <View style={dynamic.roundIconPrimary}>
              <Smile size={28} color={theme.colors.primary700} />
            </View>
          </TouchableOpacity>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={140}>
          <TouchableOpacity 
            style={dynamic.tile}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (isRecording) stopRecordingWeb(); else startRecordingWeb();
              } else {
                setShowVoiceModal(true);
              }
            }}
            testID="voice-card"
          >
            <Text style={dynamic.tileTitle}>Log by Voice</Text>
            <Text style={dynamic.tileSubtitle}>{Platform.OS === 'web' ? 'Press to record by voice.' : 'Press to record by voice.'}</Text>
            <View style={dynamic.roundIconPrimary}>
              <Mic size={28} color={theme.colors.primary700} />
            </View>
          </TouchableOpacity>
          {sttError && <Text style={[dynamic.errorText, { textAlign: 'center', marginTop: -8 }]}>{sttError}</Text>}
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={180}>
          <TouchableOpacity 
            style={dynamic.tile}
            onPress={() => router.push('/mindful-eating')}
            testID="mindful-eating-card"
          >
            <Text style={dynamic.tileTitle}>Mindful Eating</Text>
            <Text style={dynamic.tileSubtitle}>Timer and calming music.</Text>
            <View style={dynamic.roundIconPrimary}>
              <Leaf size={28} color={theme.colors.primary700} />
            </View>
          </TouchableOpacity>
        </AnimatedFadeIn>
      </ScrollView>

      <Modal
        visible={moodModal}
        transparent
        animationType="fade"
        onRequestClose={() => setMoodModal(false)}
      >
        <TouchableOpacity style={dynamic.modalOverlay} activeOpacity={1} onPress={() => setMoodModal(false)}>
          <TouchableOpacity style={dynamic.modalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamic.modalHeader}>
              <Smile size={28} color={theme.colors.primary700} />
              <Text style={dynamic.modalTitle}>Log mood</Text>
            </View>

            <View style={dynamic.emotionRow}>
              {([
                { key: 'stress', Icon: Angry },
                { key: 'boredom', Icon: Meh },
                { key: 'sad', Icon: Frown },
                { key: 'anxious', Icon: Angry },
                { key: 'tired', Icon: Meh },
                { key: 'happy', Icon: Smile },
                { key: 'neutral', Icon: Meh },
              ] as { key: MoodEmotion; Icon: any }[]).map(({ key, Icon }) => (
                <TouchableOpacity key={key} style={[dynamic.emotionPill, selectedEmotion === key && dynamic.emotionPillActive]} onPress={() => setSelectedEmotion(key)} testID={`mood-${key}`}>
                  <Icon size={16} color={selectedEmotion === key ? theme.colors.primary700 : theme.colors.textMuted} />
                  <Text style={[dynamic.emotionText, selectedEmotion === key && dynamic.emotionTextActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={dynamic.modalLabel}>Intensity (1-10)</Text>
            <TextInput
              style={dynamic.modalInput}
              value={intensity}
              onChangeText={setIntensity}
              keyboardType="numeric"
              placeholder="5"
              placeholderTextColor={theme.colors.textMuted}
              testID="mood-intensity"
            />

            <Text style={dynamic.modalLabel}>Note (optional)</Text>
            <TextInput
              style={dynamic.modalInput}
              value={moodNote}
              onChangeText={setMoodNote}
              placeholder="What triggered this?"
              placeholderTextColor={theme.colors.textMuted}
              testID="mood-note"
            />

            <View style={dynamic.modalButtons}>
              <TouchableOpacity style={dynamic.modalSecondaryBtn} onPress={() => setMoodModal(false)} testID="mood-cancel">
                <Text style={dynamic.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamic.modalPrimaryBtn}
                onPress={async () => {
                  const val = Math.max(1, Math.min(10, parseInt(intensity || '5', 10)));
                  await logMood(selectedEmotion, val, moodNote);
                  const foods = buildEmotionFoods(selectedEmotion);
                  setReportFoods(foods);
                  setReportText(buildMoodReport(selectedEmotion, val));
                  setLastSavedEmotion(selectedEmotion);
                  setMoodModal(false);
                  setShowMoodReport(true);
                }}
                testID="mood-save"
              >
                <Text style={dynamic.modalPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showMoodReport}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoodReport(false)}
      >
        <TouchableOpacity style={dynamic.modalOverlay} activeOpacity={1} onPress={() => setShowMoodReport(false)}>
          <TouchableOpacity style={dynamic.modalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamic.modalHeader}>
              <Smile size={24} color={theme.colors.primary700} />
              <Text style={dynamic.modalTitle}>Mood report</Text>
            </View>
            {lastSavedEmotion && (
              <View style={{ marginBottom: 8 }}>
                <Text style={dynamic.modalLabel}>Your state</Text>
                <Text style={{ color: theme.colors.text }}>{reportText}</Text>
              </View>
            )}

            {lastSavedEmotion && (
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <Text style={dynamic.modalLabel}>Helpful nudges</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {getNudges(lastSavedEmotion).map((n) => (
                    <View key={n.id} style={dynamic.nudgePill}>
                      <Text style={dynamic.nudgePillTitle}>{n.title}</Text>
                      <Text style={dynamic.nudgePillDesc}>{n.description}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={dynamic.modalLabel}>Recommended foods</Text>
            {reportFoods.length === 0 ? (
              <Text style={dynamic.emptyText}>No suggestions yet</Text>
            ) : (
              <View>
                {reportFoods.map((f) => (
                  <View key={f.id} style={dynamic.analysisCard} testID={`mood-report-${f.id}`}>
                    <View style={dynamic.analysisHeaderRow}>
                      <Text style={dynamic.analysisFoodName}>{f.name}</Text>
                      <View style={dynamic.caloriesPill}>
                        <Text style={dynamic.caloriesPillFire}>🔥</Text>
                        <Text style={dynamic.caloriesPillText}>{Math.round(f.calories)} kcal</Text>
                      </View>
                    </View>
                    <Text style={dynamic.analysisServingText}>Serving: {f.serving_size}</Text>
                    <View style={dynamic.analysisMacrosRow}>
                      <View style={dynamic.analysisMacroItem}><Text style={dynamic.analysisMacroLabel}>P</Text><Text style={dynamic.analysisMacroValue}>{Math.round(f.protein)} g</Text></View>
                      <View style={dynamic.analysisMacroItem}><Text style={dynamic.analysisMacroLabel}>C</Text><Text style={dynamic.analysisMacroValue}>{Math.round(f.carbs)} g</Text></View>
                      <View style={dynamic.analysisMacroItem}><Text style={dynamic.analysisMacroLabel}>F</Text><Text style={dynamic.analysisMacroValue}>{Math.round(f.fat)} g</Text></View>
                    </View>
                    <View style={dynamic.analysisActionsRow}>
                      <TouchableOpacity style={dynamic.analysisAddBtn} onPress={() => addMeal(f, 1, selectedMealType)} testID={`mood-report-add-${f.id}`}>
                        <Plus size={14} color="#fff" />
                        <Text style={dynamic.analysisAddText}>Add to {selectedMealType}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={dynamic.modalButtons}>
              <TouchableOpacity style={dynamic.modalPrimaryBtn} onPress={() => setShowMoodReport(false)} testID="mood-report-close">
                <Text style={dynamic.modalPrimaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showVoiceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVoiceModal(false)}
      >
        <TouchableOpacity style={dynamic.modalOverlay} activeOpacity={1} onPress={() => setShowVoiceModal(false)}>
          <TouchableOpacity style={dynamic.modalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamic.modalHeader}>
              <Mic size={28} color={theme.colors.primary700} />
              <Text style={dynamic.modalTitle}>Voice Food Logger</Text>
            </View>

            <Text style={dynamic.modalLabel}>Describe what you ate</Text>
            <TextInput
              style={dynamic.voiceInput}
              value={transcript}
              onChangeText={setTranscript}
              placeholder={Platform.OS === 'web' ? 'Recording fills this automatically...' : 'Use dictation on your keyboard'}
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={4}
              testID="voice-input"
            />
            {analysisError && <Text style={dynamic.errorText}>{analysisError}</Text>}

            <View style={dynamic.voiceModalButtons}>
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={[dynamic.modalSecondaryBtn, isRecording ? dynamic.voiceDangerBorder : undefined]}
                  onPress={isRecording ? stopRecordingWeb : startRecordingWeb}
                  testID="voice-modal-record"
                >
                  {isRecording ? <Square size={16} color="#EF4444" /> : <AudioLines size={16} color={theme.colors.primary700} />}
                  <Text style={[dynamic.modalSecondaryText, isRecording ? { color: '#EF4444' } : undefined]}>
                    {isRecording ? 'Stop' : 'Record'}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={dynamic.modalPrimaryBtn}
                onPress={handleAnalyzeTranscript}
                disabled={analysisLoading}
                testID="voice-analyze"
              >
                <Text style={dynamic.modalPrimaryText}>{analysisLoading ? 'Analyzing...' : 'Analyze'}</Text>
              </TouchableOpacity>
            </View>

            {analysisFoods.length > 0 && (
              <View style={dynamic.analysisResults}>
                <Text style={dynamic.analysisTitle}>Detected items</Text>
                {analysisFoods.map((f) => {
                  const calories = Math.round(f.calories ?? 0);
                  const protein = Math.round(f.protein ?? 0);
                  const carbs = Math.round(f.carbs ?? 0);
                  const fat = Math.round(f.fat ?? 0);
                  return (
                    <View key={f.id} style={dynamic.analysisCard} testID={`analysis-card-${f.id}`}>
                      <View style={dynamic.analysisHeaderRow}>
                        <Text style={dynamic.analysisFoodName}>{f.name}</Text>
                        <View style={dynamic.caloriesPill}>
                          <Text style={dynamic.caloriesPillFire}>🔥</Text>
                          <Text style={dynamic.caloriesPillText}>{calories} kcal</Text>
                        </View>
                      </View>

                      <View style={dynamic.analysisMacrosRow}>
                        <View style={dynamic.analysisMacroItem}>
                          <Text style={dynamic.analysisMacroLabel}>Protein</Text>
                          <Text style={dynamic.analysisMacroValue}>{protein} g</Text>
                        </View>
                        <View style={dynamic.analysisMacroItem}>
                          <Text style={dynamic.analysisMacroLabel}>Carbs</Text>
                          <Text style={dynamic.analysisMacroValue}>{carbs} g</Text>
                        </View>
                        <View style={dynamic.analysisMacroItem}>
                          <Text style={dynamic.analysisMacroLabel}>Fat</Text>
                          <Text style={dynamic.analysisMacroValue}>{fat} g</Text>
                        </View>
                      </View>

                      <Text style={dynamic.analysisServingText}>Serving: {f.serving_size ?? '1 serving'}</Text>

                      <View style={dynamic.analysisActionsRow}>
                        <TouchableOpacity style={dynamic.analysisAddBtn} onPress={() => addMeal(f, 1, selectedMealType)} testID={`voice-add-${f.id}`}>
                          <Plus size={14} color="#fff" />
                          <Text style={dynamic.analysisAddText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity style={dynamic.addAllBtn} onPress={handleAddAllAnalyzed} testID="voice-add-all">
                  <Plus size={16} color="#fff" />
                  <Text style={dynamic.addAllText}>Add all to {selectedMealType}</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  topHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  headerBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  headerSubtitle: { textAlign: 'center', color: Theme.colors.textMuted, fontSize: 16, paddingHorizontal: 24, paddingTop: 6, paddingBottom: 18 },
  tile: { backgroundColor: Theme.colors.surface, marginHorizontal: 16, marginVertical: 14, borderRadius: 16, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  tileTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginBottom: 6 },
  tileSubtitle: { fontSize: 14, color: Theme.colors.textMuted, marginBottom: 18 },
  roundIconPrimary: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(59,130,246,0.15)' },
  voiceActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Theme.colors.primary700, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignSelf: 'center', marginTop: 8 },
  voiceStopBtn: { backgroundColor: '#EF4444' },
  voiceActionText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  modalLabel: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 12,
  },
  voiceInput: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 96,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  voiceDangerBorder: {
    borderColor: '#EF4444',
  },
  modalSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary700,
  },
  modalPrimaryBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary700,
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emotionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  emotionPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Theme.colors.background, borderWidth: 1, borderColor: Theme.colors.border },
  emotionPillActive: { backgroundColor: '#EEF4FF', borderColor: Theme.colors.primary700 },
  emotionText: { fontSize: 12, color: Theme.colors.textMuted, fontWeight: '700', textTransform: 'capitalize' },
  emotionTextActive: { color: Theme.colors.primary700 },
  nudgePill: {
    width: 220,
    marginRight: 10,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 14,
    padding: 12,
  },
  nudgePillTitle: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, marginBottom: 4 },
  nudgePillDesc: { fontSize: 12, color: Theme.colors.textMuted },
  emptyText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  analysisResults: {
    marginTop: 8,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  caloriesPillFire: {
    fontSize: 12,
  },
  caloriesPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  analysisMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  analysisMacroItem: {
    flex: 1,
    alignItems: 'center',
  },
  analysisMacroLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  analysisMacroValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginTop: 2,
  },
  analysisServingText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  analysisActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  analysisFoodName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  analysisAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary700,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  analysisAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addAllBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 14,
  },
  addAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  voiceModalButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
});
