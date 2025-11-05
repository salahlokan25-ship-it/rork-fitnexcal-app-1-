import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ImagePlus } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateFutureBodyVisualization } from '@/services/future-visualizer';

type GoalType = 'lose-weight' | 'maintain' | 'gain-muscle';
type Timeline = '3-months' | '6-months' | '12-months';

export default function FutureVisualizerScreen() {
  const insets = useSafeAreaInsets();
  const [goalType, setGoalType] = useState<GoalType>('lose-weight');
  const [timeline, setTimeline] = useState<Timeline>('3-months');
  const [targetWeight, setTargetWeight] = useState<number>(75);
  const [bodyFat, setBodyFat] = useState<number>(15);
  const [calories, setCalories] = useState<number>(-15);
  const [protein, setProtein] = useState<number>(10);
  const [sourceImage, setSourceImage] = useState<{ uri: string } | null>(null);
  const [futureImage, setFutureImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const pickFromLibrary = useCallback(async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        setSourceImage({ uri: res.assets[0].uri });
        setFutureImage(null);
      }
    } catch (e) {
      console.error('[FutureVisualizer] pickFromLibrary error', e);
      Alert.alert('Error', 'Could not open library. Please try again.');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera access is required to take a photo.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        setSourceImage({ uri: res.assets[0].uri });
        setFutureImage(null);
      }
    } catch (e) {
      console.error('[FutureVisualizer] takePhoto error', e);
      Alert.alert('Error', 'Could not take photo. Please try again.');
    }
  }, []);

  const handleGenerateFuture = useCallback(async () => {
    if (!sourceImage) {
      Alert.alert('No Image', 'Please upload or take a photo first.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(sourceImage.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          
          let scenario: 'current' | 'reduce_15' | 'increase_protein' = 'current';
          if (goalType === 'lose-weight' && calories < 0) {
            scenario = 'reduce_15';
          } else if (goalType === 'gain-muscle' && protein > 0) {
            scenario = 'increase_protein';
          }

          let horizon: '2w' | '1m' | '3m' = '3m';
          if (timeline === '3-months') horizon = '3m';
          else if (timeline === '6-months') horizon = '3m';
          else if (timeline === '12-months') horizon = '3m';

          const result = await generateFutureBodyVisualization({
            scenario,
            horizon,
            imageBase64: base64data,
            userStats: {
              weightKg: targetWeight,
              bodyFatPct: bodyFat,
              avgDailyCalories: 2000 + (calories * 20),
              avgProteinGrams: 150 + (protein * 1.5),
            },
          });

          setFutureImage(`data:image/jpeg;base64,${result.imageBase64}`);
          Alert.alert('Success', 'Your future body has been generated!');
        } catch (err) {
          console.error('[FutureVisualizer] generation failed', err);
          Alert.alert('Error', err instanceof Error ? err.message : 'Failed to generate future body. Please try again.');
        } finally {
          setIsGenerating(false);
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('[FutureVisualizer] image read error', err);
      Alert.alert('Error', 'Failed to read image. Please try again.');
      setIsGenerating(false);
    }
  }, [sourceImage, goalType, timeline, targetWeight, bodyFat, calories, protein]);

  const handleSetGoal = useCallback(() => {
    Alert.alert('Goal Set', 'Your fitness goal has been set successfully!');
  }, []);

  return (
    <ErrorBoundary>
      <View style={styles.screen} testID="future-visualizer-screen">
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            testID="back-button"
          >
            <ArrowLeft color="#71717a" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Future Body Visualizer</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 220 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bodyImageContainer}>
            <View style={styles.bodyImageWrapper}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#137fec" />
                  <Text style={styles.loadingText}>Generating your future body...</Text>
                </View>
              ) : futureImage && sourceImage ? (
                <View style={styles.compareRow}>
                  <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>Before</Text>
                    <View style={styles.compareImageBox}>
                      <Image
                        source={{ uri: sourceImage.uri }}
                        style={styles.bodyImage}
                        resizeMode="cover"
                        testID="before-image"
                      />
                    </View>
                  </View>
                  <View style={styles.compareCol}>
                    <Text style={styles.compareLabel}>After</Text>
                    <View style={styles.compareImageBox}>
                      <Image
                        source={{ uri: futureImage }}
                        style={styles.bodyImage}
                        resizeMode="cover"
                        testID="after-image"
                      />
                    </View>
                  </View>
                </View>
              ) : sourceImage ? (
                <View style={styles.compareSingleBox}>
                  <Image
                    source={{ uri: sourceImage.uri }}
                    style={styles.bodyImage}
                    resizeMode="cover"
                    testID="single-image"
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX-BZPEeMnjmEv4auoygb7lYAJaZINLyRTdoLHTrrq2IAcpxPfecu5sMNNmyHkPN7gMenbHDGtlqwJAT5TnptDT1O3rgT9X7MPphHO84ibXKj574NvWAdFriPLfZDmfVCVm0IJX_yBTgKuEyqLhQ1PhDIdnaDZJy12gskW3hBnulTERBZitmYB5Yy5o6MFYhCidRT9aj9nOjD5hO2ybyacld5Ldumfu4cTlz6gqPQsrs9aMThfMMEU2QSWjMoQhFqWzexCwpaffkQu' }}
                  style={styles.bodyImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>

          <View style={styles.contentPadding}>
            <Text style={styles.instructionText}>
              Adjust the sliders below to see your potential transformation.
            </Text>

            <View style={styles.photoButtonsRow}>
              <TouchableOpacity 
                onPress={takePhoto} 
                style={styles.photoButton}
                testID="take-photo-btn"
              >
                <Camera color="#ffffff" size={20} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickFromLibrary} 
                style={styles.photoButton}
                testID="choose-photo-btn"
              >
                <ImagePlus color="#ffffff" size={20} />
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Set Your Goal</Text>

          <View style={styles.selectorsRow}>
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Goal Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={goalType}
                  onValueChange={(value: GoalType) => setGoalType(value)}
                  style={styles.picker}
                  dropdownIconColor="#ffffff"
                  testID="goal-type-picker"
                >
                  <Picker.Item label="Lose Weight" value="lose-weight" />
                  <Picker.Item label="Maintain" value="maintain" />
                  <Picker.Item label="Gain Muscle" value="gain-muscle" />
                </Picker>
              </View>
            </View>
            <View style={styles.selectContainer}>
              <Text style={styles.selectLabel}>Timeline</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={timeline}
                  onValueChange={(value: Timeline) => setTimeline(value)}
                  style={styles.picker}
                  dropdownIconColor="#ffffff"
                  testID="timeline-picker"
                >
                  <Picker.Item label="3 Months" value="3-months" />
                  <Picker.Item label="6 Months" value="6-months" />
                  <Picker.Item label="12 Months" value="12-months" />
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.slidersContainer}>
            <View style={styles.sliderGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Target Weight</Text>
                <Text style={styles.sliderValue}>{targetWeight} kg</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={50}
                maximumValue={100}
                value={targetWeight}
                onValueChange={setTargetWeight}
                minimumTrackTintColor="#137fec"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#137fec"
                testID="target-weight-slider"
              />
            </View>

            <View style={styles.sliderGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Body Fat %</Text>
                <Text style={styles.sliderValue}>{bodyFat} %</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={40}
                value={bodyFat}
                onValueChange={setBodyFat}
                minimumTrackTintColor="#137fec"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#137fec"
                testID="body-fat-slider"
              />
            </View>

            <View style={styles.sliderGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Calories</Text>
                <Text style={styles.sliderValue}>{calories > 0 ? '+' : ''}{calories}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={-100}
                maximumValue={100}
                value={calories}
                onValueChange={setCalories}
                minimumTrackTintColor="#137fec"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#137fec"
                testID="calories-slider"
              />
            </View>

            <View style={styles.sliderGroup}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Protein</Text>
                <Text style={styles.sliderValue}>{protein > 0 ? '+' : ''}{protein}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={-100}
                maximumValue={100}
                value={protein}
                onValueChange={setProtein}
                minimumTrackTintColor="#137fec"
                maximumTrackTintColor="#3f3f46"
                thumbTintColor="#137fec"
                testID="protein-slider"
              />
            </View>
          </View>

          <Text style={styles.disclaimerText}>
            This visualization is an AI-powered estimation for motivational purposes only. Actual results may vary.
          </Text>
        </ScrollView>

        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
          <View style={styles.projectionCard}>
            <View style={styles.projectionLeft}>
              <Text style={styles.projectionTitle}>Your Projection</Text>
              <Text style={styles.projectionDate}>Est. Aug 2024</Text>
            </View>
            <View style={styles.projectionRight}>
              <Text style={styles.projectionWeight}>{targetWeight.toFixed(1)} kg</Text>
              <Text style={styles.projectionChange}>-{(85 - targetWeight).toFixed(0)} kg</Text>
            </View>
            <View style={styles.projectionRight}>
              <Text style={styles.projectionWeight}>{bodyFat.toFixed(1)} %</Text>
              <Text style={styles.projectionChange}>-{(20 - bodyFat).toFixed(0)} %</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={handleGenerateFuture} 
            style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
            disabled={isGenerating || !sourceImage}
            testID="generate-future-btn"
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'Generating...' : 'Generate Future Body'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSetGoal} 
            style={styles.setGoalButton}
            testID="set-goal-btn"
          >
            <Text style={styles.setGoalText}>Set This as My Goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#101922',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 240,
  },
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleWrapper: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: '#1C2632',
    borderRadius: 12,
    padding: 6,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#101922',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717a',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  bodyImageContainer: {
    width: '100%',
    paddingVertical: 12,
    minHeight: 420,
  },
  bodyImageWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 4,
  },
  bodyImage: {
    width: '100%',
    height: '100%',
  },
  compareRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  compareCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  compareLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  compareImageBox: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0b0f14',
  },
  compareSingleBox: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0b0f14',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#1C2632',
    borderRadius: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  selectorsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectContainer: {
    flex: 1,
  },
  selectLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  selectWrapper: {
    height: 56,
    backgroundColor: '#27303d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  selectValue: {
    fontSize: 16,
    color: '#ffffff',
  },
  pickerWrapper: {
    height: 56,
    backgroundColor: '#1C2632',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27303d',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    height: 56,
    backgroundColor: '#1C2632',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  generateButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    backgroundColor: '#3f3f46',
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  slidersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 24,
  },
  sliderGroup: {
    width: '100%',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#137fec',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  disclaimerText: {
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 12,
    textAlign: 'center',
    color: '#52525b',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#101922',
    borderTopWidth: 1,
    borderTopColor: '#27303d',
  },
  projectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27303d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  projectionLeft: {
    flex: 1,
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  projectionDate: {
    fontSize: 14,
    color: '#71717a',
  },
  projectionRight: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  projectionWeight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  projectionChange: {
    fontSize: 14,
    color: '#22c55e',
  },
  setGoalButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#137fec',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  setGoalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
