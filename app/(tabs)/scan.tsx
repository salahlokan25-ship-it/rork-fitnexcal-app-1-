import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Zap, BarChart3 } from 'lucide-react-native';
import { analyzeFoodImage } from '@/services/ai-service';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/theme';

export default function ScanScreen() {
  const { theme } = useTheme();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#007AFF" />
          <Text style={[styles.permissionTitle, { color: theme.colors.text }]}>Camera Access Required</Text>
          <Text style={[styles.permissionText, { color: theme.colors.textMuted }]}>
            We need camera access to analyze your food photos and provide accurate calorie information.
          </Text>
          <TouchableOpacity testID="grant-permission" style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Scan Your Food</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Take a photo to get instant nutrition info</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Position food within the frame</Text>
          </View>
        </CameraView>
      </View>

      <View style={[styles.controls, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity style={styles.controlButton} onPress={pickImage}>
          <ImageIcon size={24} color="#007AFF" />
          <Text style={styles.controlText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
          disabled={isAnalyzing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
          <Camera size={24} color="#007AFF" />
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tips, { backgroundColor: theme.colors.background }]}>
        <View style={styles.tipItem}>
          <BarChart3 size={20} color="#007AFF" />
          <Text style={[styles.tipText, { color: theme.colors.text }]}>Get accurate calorie counts instantly</Text>
        </View>
        <Text style={[styles.tipSubtext, { color: theme.colors.textMuted }]}>
          For best results, ensure good lighting and include the entire meal in the frame
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
  },
  tips: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tipSubtext: {
    fontSize: 14,
    lineHeight: 20,
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
