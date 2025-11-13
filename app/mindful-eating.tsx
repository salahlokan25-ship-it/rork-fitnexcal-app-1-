import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { ArrowLeft, X, Play, VolumeX, Volume2 } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

// Web audio fallback type
// DOM types exist on web; on native they'll be erased by Platform check
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type WebAudio = {
  el: HTMLAudioElement;
  play: () => Promise<void>;
  pause: () => void;
  unload: () => void;
  setVolume: (v: number) => void;
  isPlaying: () => boolean;
};

type AudioChoice = 'Peaceful Piano' | 'Forest Rain' | 'Ocean Waves' | 'Meditation Ambient';

const AUDIO_TRACKS: Record<AudioChoice, string> = {
  'Peaceful Piano': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_58e1f0f7c3.mp3?filename=peaceful-piano-ambient-112191.mp3',
  'Forest Rain': 'https://cdn.pixabay.com/download/audio/2021/09/13/audio_bf0c1ac3a1.mp3?filename=forest-rain-ambient-9162.mp3',
  'Ocean Waves': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_4b2b742d4c.mp3?filename=calm-ocean-waves-110624.mp3',
  'Meditation Ambient': 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_8f2e9b7c26.mp3?filename=meditation-background-ambient-124008.mp3',
};

const MINDFUL_TIPS = [
  'Notice the textures of your food.',
  'Take a moment to appreciate the colors on your plate.',
  'Chew slowly and count to 20.',
  'Put your utensils down between bites.',
  'Notice how your body feels as you eat.',
  'Take three deep breaths before you start.',
];

export default function MindfulEatingScreen() {
  const { theme, mode } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => themedStyles(theme, mode), [theme, mode]);

  const [totalSeconds] = useState<number>(20 * 60);
  const [remaining, setRemaining] = useState<number>(20 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [audioChoice, setAudioChoice] = useState<AudioChoice>('Peaceful Piano');
  const [volume, setVolume] = useState<number>(0.6);
  const [showTip, setShowTip] = useState<boolean>(true);
  const [currentTip] = useState<string>(MINDFUL_TIPS[Math.floor(Math.random() * MINDFUL_TIPS.length)]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<any>(null);

  const isWeb = Platform.OS === 'web';

  const progress = Math.max(0, Math.min(1, (totalSeconds - remaining) / totalSeconds));
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  const createWebAudio = useCallback((uri: string): WebAudio => {
    const el = new Audio(uri);
    el.loop = true;
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    const api: WebAudio = {
      el,
      async play() {
        console.log('[MindfulEating][web] trying to play');
        await el.play();
      },
      pause() {
        console.log('[MindfulEating][web] pause');
        el.pause();
      },
      unload() {
        console.log('[MindfulEating][web] unload');
        el.pause();
        el.src = '';
      },
      setVolume(v: number) {
        el.volume = Math.max(0, Math.min(1, v));
      },
      isPlaying() {
        return !!(!el.paused && !el.ended && el.currentTime > 0);
      },
    };
    return api;
  }, []);

  const ensureSoundLoaded = useCallback(async () => {
    try {
      const uri = AUDIO_TRACKS[audioChoice];
      if (isWeb) {
        if (soundRef.current?.el) return soundRef.current as WebAudio;
        const wa = createWebAudio(uri);
        wa.setVolume(volume);
        soundRef.current = wa;
        console.log('[MindfulEating] web audio created', uri);
        return wa;
      }

      const { Audio } = await import('expo-av');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (soundRef.current?.playAsync) return soundRef.current;

      const created = await Audio.Sound.createAsync(
        { uri },
        { isLooping: true, volume }
      );
      const sound = created.sound;
      soundRef.current = sound;
      console.log('[MindfulEating] native sound created', uri);
      return sound;
    } catch (e) {
      console.log('[MindfulEating] audio load error', e);
      return null;
    }
  }, [audioChoice, volume, isWeb, createWebAudio]);

  const reloadTrack = useCallback(async () => {
    try {
      if (soundRef.current) {
        if (isWeb && soundRef.current.unload) {
          soundRef.current.unload();
        } else if (soundRef.current?.unloadAsync) {
          await soundRef.current.unloadAsync();
        }
        soundRef.current = null;
      }
      const snd = await ensureSoundLoaded();
      if (!snd) return;
      if (isWeb) {
        (snd as WebAudio).setVolume(volume);
        if (running) {
          try {
            await (snd as WebAudio).play();
          } catch (e) {
            console.log('[MindfulEating] web reload play blocked', e);
          }
        }
      } else {
        await snd.setVolumeAsync?.(volume);
        if (running) {
          try {
            await snd.playAsync?.();
          } catch (e) {
            console.log('[MindfulEating] reload play blocked', e);
          }
        }
      }
    } catch (e) {
      console.log('[MindfulEating] reload error', e);
    }
  }, [ensureSoundLoaded, running, volume, isWeb]);

  const startMusicIfNeeded = useCallback(async () => {
    const snd = await ensureSoundLoaded();
    if (!snd) return;
    try {
      if (isWeb) {
        (snd as WebAudio).setVolume(volume);
        if (!(snd as WebAudio).isPlaying()) {
          await (snd as WebAudio).play();
        }
      } else {
        await snd.setVolumeAsync?.(volume);
        const status: any = await snd.getStatusAsync?.();
        if (!status?.isPlaying) {
          await snd.playAsync?.();
        }
      }
    } catch (e) {
      console.log('[MindfulEating] play error', e);
    }
  }, [ensureSoundLoaded, volume, isWeb]);

  const stopMusic = useCallback(async () => {
    try {
      if (isWeb) {
        soundRef.current?.pause?.();
      } else {
        await soundRef.current?.pauseAsync?.();
      }
    } catch (e) {
      console.log('[MindfulEating] stop error', e);
    }
  }, [isWeb]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      (async () => {
        try {
          if (isWeb) {
            soundRef.current?.unload?.();
          } else {
            await soundRef.current?.unloadAsync?.();
          }
        } catch (e) {
          console.log('[MindfulEating] cleanup error', e);
        }
      })();
    };
  }, [isWeb]);

  useEffect(() => {
    if (running) {
      startMusicIfNeeded();
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          const next = Math.max(0, r - 1);
          if (next === 0) {
            setRunning(false);
            stopMusic();
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopMusic();
    }
  }, [running, startMusicIfNeeded, stopMusic]);

  useEffect(() => {
    if (!soundRef.current) return;
    (async () => {
      try {
        if (isWeb) {
          soundRef.current?.setVolume?.(volume);
        } else {
          await soundRef.current.setVolumeAsync?.(volume);
        }
      } catch (e) {
        console.log('[MindfulEating] volume error', e);
      }
    })();
  }, [volume, isWeb]);

  useEffect(() => {
    reloadTrack();
  }, [audioChoice]);

  const toggleRun = useCallback(() => {
    setRunning((v) => !v);
  }, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = Math.floor(remaining % 60).toString().padStart(2, '0');

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={handleBack}
          testID="back-button"
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mindful Eating</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.main}>
        <View style={styles.topSection}>
          <View style={styles.circleContainer}>
            <Svg width={256} height={256} viewBox="0 0 120 120" style={styles.svgCircle}>
              <Circle
                cx="60"
                cy="60"
                r="54"
                stroke={mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeWidth="12"
                fill="none"
              />
              <Circle
                cx="60"
                cy="60"
                r="54"
                stroke="#4A90E2"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </Svg>
            <View style={styles.timerInner}>
              <Text style={styles.timerText} testID="mindful-time">{mins}:{secs}</Text>
              <Text style={styles.timerLabel}>Total Time</Text>
            </View>
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Take a bite</Text>
            <Text style={styles.instructionSubtitle}>Put your utensils down</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.controlsSection}>
            <View style={styles.segmentedControl}>
              {(['Peaceful Piano', 'Forest Rain', 'Ocean Waves', 'Meditation Ambient'] as AudioChoice[]).map((choice) => (
                <TouchableOpacity
                  key={choice}
                  style={[
                    styles.segment,
                    audioChoice === choice && styles.segmentActive
                  ]}
                  onPress={() => setAudioChoice(choice)}
                  testID={`audio-${choice.toLowerCase().replace(' ', '-')}`}
                >
                  <Text style={[
                    styles.segmentText,
                    audioChoice === choice && styles.segmentTextActive
                  ]}>
                    {choice}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.volumeContainer}>
              <VolumeX size={20} color={theme.colors.textMuted} />
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${volume * 100}%` }]} />
                  <View style={[styles.sliderThumb, { left: `${volume * 100}%` }]} />
                </View>
                <View style={styles.sliderTouchable}>
                  {[...Array(11)].map((_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.sliderSegment}
                      onPress={() => setVolume(i / 10)}
                      testID={`volume-${i * 10}`}
                    />
                  ))}
                </View>
              </View>
              <Volume2 size={20} color={theme.colors.textMuted} />
            </View>
          </View>

          {showTip && (
            <View style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Mindful Tip</Text>
                <Text style={styles.tipText}>{currentTip}</Text>
              </View>
              <TouchableOpacity 
                style={styles.tipClose} 
                onPress={() => setShowTip(false)}
                testID="close-tip"
              >
                <X size={18} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            style={styles.startButton} 
            onPress={toggleRun}
            testID="toggle-run"
          >
            <Play size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.startButtonText}>
              {running ? 'Pause Session' : 'Start Session'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const themedStyles = (theme: any, mode: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  headerBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 24,
  },
  circleContainer: {
    position: 'relative' as const,
    width: 256,
    height: 256,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgCircle: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  timerInner: {
    width: 208,
    height: 208,
    borderRadius: 104,
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  instructionContainer: {
    gap: 4,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  instructionSubtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 24,
  },
  controlsSection: {
    gap: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 6,
    height: 48,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: mode === 'dark' ? '#374151' : theme.colors.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  segmentTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 16,
  },
  sliderContainer: {
    flex: 1,
    height: 16,
    justifyContent: 'center',
    position: 'relative' as const,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    position: 'relative' as const,
  },
  sliderFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    height: 6,
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute' as const,
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    borderWidth: 2,
    borderColor: theme.colors.background,
    marginLeft: -8,
  },
  sliderTouchable: {
    position: 'absolute' as const,
    top: -8,
    left: 0,
    right: 0,
    height: 32,
    flexDirection: 'row',
  },
  sliderSegment: {
    flex: 1,
    height: 32,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: mode === 'dark' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  tipClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: mode === 'dark' ? '#374151' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
