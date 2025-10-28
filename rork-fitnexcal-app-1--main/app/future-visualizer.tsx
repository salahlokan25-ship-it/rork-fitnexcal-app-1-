import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, Sparkles, Clock, SlidersHorizontal } from 'lucide-react-native';
import ErrorBoundary from '@/components/ErrorBoundary';
import { generateFutureBodyVisualization } from '@/services/future-visualizer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

 type Scenario = 'current' | 'reduce_15' | 'increase_protein';
 type Horizon = '2w' | '1m' | '3m';

export default function FutureVisualizerScreen() {
  const insets = useSafeAreaInsets();
  const [scenario, setScenario] = useState<Scenario>('current');
  const [horizon, setHorizon] = useState<Horizon>('2w');
  const [sourceImage, setSourceImage] = useState<{ uri: string; base64: string } | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const pickFromLibrary = useCallback(async () => {
    setErrorText('');
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri && res.assets[0]?.base64) {
        setSourceImage({ uri: res.assets[0].uri, base64: res.assets[0].base64 });
        setResultImage(null);
      }
    } catch (e) {
      console.error('[FutureVisualizer] pickFromLibrary error', e);
      setErrorText('Could not open library. Please try again.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    setErrorText('');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take a photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 1,
        base64: true,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri && res.assets[0]?.base64) {
        setSourceImage({ uri: res.assets[0].uri, base64: res.assets[0].base64 });
        setResultImage(null);
      }
    } catch (e) {
      console.error('[FutureVisualizer] takePhoto error', e);
      setErrorText('Could not take photo. Please try again.');
    }
  }, []);

  const canGenerate = useMemo(() => !!sourceImage && !isLoading, [sourceImage, isLoading]);

  const onGenerate = useCallback(async () => {
    if (!sourceImage) return;
    setIsLoading(true);
    setErrorText('');
    try {
      const result = await generateFutureBodyVisualization({
        scenario,
        horizon,
        imageBase64: sourceImage.base64,
      });
      setResultImage(`data:image/png;base64,${result.imageBase64}`);
    } catch (e) {
      console.error('[FutureVisualizer] generate error', e);
      const msg = e instanceof Error ? e.message : 'Generation failed. Try a clear, full-body photo on a neutral background.';
      setErrorText(msg);
    } finally {
      setIsLoading(false);
    }
  }, [horizon, scenario, sourceImage]);

  return (
    <ErrorBoundary>
      <View style={styles.screen} testID="future-visualizer-screen">
        <Stack.Screen options={{ title: 'Future Body Visualizer' }} />
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 16 + insets.bottom }] } showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Sparkles color="#1f7aec" size={24} />
            </View>
            <Text style={styles.heroTitle}>See your visual future self</Text>
            <Text style={styles.heroSubtitle}>Predict 2w • 1m • 3m based on your habits</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your photo</Text>
            <Text style={styles.cardSubtitle}>Use a clear, full-body photo on a neutral background</Text>
            <View style={styles.photoRow}>
              <TouchableOpacity onPress={takePhoto} style={styles.actionBtn} testID="take-photo-btn">
                <Camera color="#0b63ff" size={20} />
                <Text style={styles.actionText}>Take photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickFromLibrary} style={styles.actionBtn} testID="pick-photo-btn">
                <ImagePlus color="#0b63ff" size={20} />
                <Text style={styles.actionText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {sourceImage?.uri ? (
              <Image source={{ uri: sourceImage.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Text style={styles.previewText}>No photo selected</Text>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scenario</Text>
            <View style={styles.segment}>
              {(
                [
                  { key: 'current', label: 'Current' },
                  { key: 'reduce_15', label: '-15% kcal' },
                  { key: 'increase_protein', label: '+Protein' },
                ] as { key: Scenario; label: string }[]
              ).map((opt) => {
                const selected = scenario === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => setScenario(opt.key)}
                    style={[styles.segmentItem, selected ? styles.segmentItemActive : undefined]}
                    testID={`scenario-${opt.key}`}
                  >
                    <Text style={[styles.segmentText, selected ? styles.segmentTextActive : undefined]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.horizonRow}>
              <Clock color="#4b5563" size={18} />
              {(['2w', '1m', '3m'] as Horizon[]).map((h) => {
                const selected = horizon === h;
                return (
                  <TouchableOpacity
                    key={h}
                    onPress={() => setHorizon(h)}
                    style={[styles.horizonChip, selected ? styles.horizonChipActive : undefined]}
                    testID={`horizon-${h}`}
                  >
                    <Text style={[styles.horizonText, selected ? styles.horizonTextActive : undefined]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <SlidersHorizontal color="#4b5563" size={18} />
            </View>
          </View>

          <TouchableOpacity
            onPress={onGenerate}
            disabled={!canGenerate}
            style={[styles.generateBtn, !canGenerate ? styles.generateBtnDisabled : undefined]}
            testID="generate-btn"
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.generateText}>Generate</Text>
            )}
          </TouchableOpacity>

          {errorText ? (
            <Text style={styles.errorText} testID="error-text">{errorText}</Text>
          ) : null}

          {resultImage ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Prediction</Text>
              <Image source={{ uri: resultImage }} style={styles.result} resizeMode="cover" />
              <Text style={styles.resultCaption}>AI visualization. For motivation only, not medical advice.</Text>
            </View>
          ) : null}

          <View style={styles.footerSpacer} />
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0f1a' },
  container: { padding: 16 },
  hero: {
    backgroundColor: '#0d1424',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(31,122,236,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroSubtitle: { color: '#c7d2fe', fontSize: 13 },

  card: {
    marginTop: 16,
    backgroundColor: '#0d1424',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardSubtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 10 },

  photoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(11,99,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,99,255,0.35)',
  },
  actionText: { color: '#bcd7ff', fontWeight: '700' as const },

  preview: { width: '100%', height: 260, borderRadius: 12 },
  previewPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: { color: '#6b7280' },

  segment: {
    flexDirection: 'row',
    backgroundColor: '#0a1020',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 4,
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segmentItemActive: { backgroundColor: 'rgba(11,99,255,0.18)' },
  segmentText: { color: '#93a0b4', fontWeight: '700' as const },
  segmentTextActive: { color: '#e5f0ff' },

  horizonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  horizonChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    backgroundColor: 'transparent',
  },
  horizonChipActive: { backgroundColor: 'rgba(11,99,255,0.18)', borderColor: 'rgba(11,99,255,0.45)' },
  horizonText: { color: '#a1a1aa', fontWeight: '700' as const },
  horizonTextActive: { color: '#e5f0ff' },

  generateBtn: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateText: { color: 'white', fontSize: 16, fontWeight: '800' as const },
  errorText: { color: '#fca5a5', marginTop: 10 },

  result: { width: '100%', height: 320, borderRadius: 12, marginTop: 8 },
  resultCaption: { color: '#8da2c2', fontSize: 12, marginTop: 8 },
  footerSpacer: { height: 40 },
});
