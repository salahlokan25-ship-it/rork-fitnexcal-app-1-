import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Zap, ArrowLeft, FlipHorizontal, ImageIcon } from 'lucide-react-native';
import { analyzeFoodImage } from '@/services/ai-service';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/theme';

export default function ScanScreen() {
  const { theme } = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  if (!permission.granted) {
    const handleRequestPermission = async () => {
      try {
        console.log('[Scan] Requesting camera permission');
        const res = await requestPermission();
        console.log('[Scan] Permission response', res);
        if (!res?.granted) {
          Alert.alert(
            'Permission Required',
            'Camera access is needed to scan food. You can enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } catch (e) {
        console.error('[Scan] Permission request error', e);
        Alert.alert('Error', 'Could not request camera permission. Please try again.');
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: '#101922' }]}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Food</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Zap size={24} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        <View style={styles.permissionContent}>
          <View style={styles.permissionPreview}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80' }} 
              style={styles.permissionImage}
            />
            <View style={styles.permissionOverlay}>
              <View style={styles.foodInfoCard}>
                <Text style={styles.foodName}>Salmon with Asparagus</Text>
                <View style={styles.nutritionRow}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>350</Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>40g</Text>
                    <Text style={styles.nutritionLabel}>Proteins</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>20g</Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>5g</Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.permissionBottom}>
            <Text style={styles.permissionInstructionText}>
              Center your meal in the frame and tap the button to capture.
            </Text>
            <TouchableOpacity testID="grant-permission" style={styles.grantButton} onPress={handleRequestPermission}>
              <Text style={styles.grantButtonText}>Grant Camera Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo?.base64) {
        setCapturedImage(photo.uri);
        await analyzeImage(photo.base64);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      console.log('[Scan] Requesting media library permission');
      const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[Scan] Media library permission', mediaPerm);
      if (!mediaPerm.granted) {
        Alert.alert(
          'Permission Required',
          'Photos access is needed to upload images. You can enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        setCapturedImage(result.assets[0].uri ?? null);
        await analyzeImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeFoodImage(base64Image);
      
      if (analysis.foods.length === 0) {
        Alert.alert(
          'No Food Detected',
          'We couldn\'t identify any food items in this image. Please try taking another photo with better lighting and a clear view of the food.'
        );
        return;
      }

      const dataUrl = `data:image/jpeg;base64,${base64Image}`;

      router.push({
        pathname: '/food-analysis',
        params: {
          analysis: JSON.stringify(analysis),
          imageUri: dataUrl,
        },
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert(
        'Analysis Failed',
        'Failed to analyze the food image. Please check your internet connection and try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setCapturedImage(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.analysisContainer}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          <View style={styles.analysisOverlay}>
            <Zap size={48} color="#007AFF" />
            <Text style={styles.analysisTitle}>Analyzing Your Food...</Text>
            <Text style={styles.analysisText}>
              Our AI is identifying the food items and calculating nutritional information.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Scan Food</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <Zap size={24} color={flashEnabled ? '#137fec' : theme.colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={flashEnabled}
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={[styles.instructionText, { color: theme.colors.textMuted }]}>
            Center your meal in the frame and tap the button to capture.
          </Text>

          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]} 
              onPress={pickImage}
            >
              <ImageIcon size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              disabled={isAnalyzing}
            >
              <View style={styles.captureButtonOuter}>
                <View style={styles.captureButtonInner}>
                  <Camera size={32} color="white" strokeWidth={2} fill="white" />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surface }]} 
              onPress={toggleCameraFacing}
            >
              <FlipHorizontal size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  permissionPreview: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#18181b',
    position: 'relative',
  },
  permissionImage: {
    width: '100%',
    height: '100%',
  },
  permissionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodInfoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 12,
    backdropFilter: 'blur(8px)',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  nutritionLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  permissionBottom: {
    paddingTop: 24,
  },
  permissionInstructionText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#9ca3af',
    marginBottom: 24,
    lineHeight: 20,
  },
  grantButton: {
    backgroundColor: '#137fec',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  grantButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#18181b',
  },
  camera: {
    flex: 1,
  },

  bottomSection: {
    paddingTop: 24,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#137fec',
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#137fec',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContainer: {
    flex: 1,
    position: 'relative',
  },
  capturedImage: {
    flex: 1,
    width: '100%',
  },
  analysisOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  analysisTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  analysisText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
});
