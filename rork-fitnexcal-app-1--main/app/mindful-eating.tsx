import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, TouchableHighlight, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import CircularProgress from '@/components/CircularProgress';
import { Play, Pause, Clock, Music2, Volume2, VolumeX, RotateCcw } from 'lucide-react-native';


type Track = { id: string; title: string; uri: string; attribution: string; fallbackUri?: string };

// Categorize tracks like Pixabay
const TRACKS_BY_CATEGORY = [
  {
    category: 'Meditation & Relaxation',
    tracks: [
      {
        id: 'calm_meditation',
        title: 'Calm Meditation',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'peaceful_mind',
        title: 'Peaceful Mind',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-04.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'zen_garden',
        title: 'Zen Garden',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/glass-break-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'ambient_relaxation',
        title: 'Ambient Relaxation',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-03.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'honor_hymn',
        title: 'Honor Hymn',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },

    ]
  },
  {
    category: 'Nature & Environment',
    tracks: [
      {
        id: 'forest_melody',
        title: 'Forest Melody',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/strong-wind-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'gentle_rain',
        title: 'Gentle Rain',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/strong-wind-02.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'ocean_waves',
        title: 'Ocean Waves',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/metal-bell-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'nature_sounds',
        title: 'Nature Sounds',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/glass-break-02.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'calm_waters',
        title: 'Calm Waters',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/strong-wind-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
    ]
  },
  {
    category: 'Focus & Study',
    tracks: [
      {
        id: 'deep_focus',
        title: 'Deep Focus',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-02.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'soft_piano',
        title: 'Soft Piano',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'relaxing_guitar',
        title: 'Relaxing Guitar',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/metal-bell-02.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'lofi_chill',
        title: 'LoFi Chill',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/woosh-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'mindful_studies',
        title: 'Mindful Studies',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-02.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
      {
        id: 'calm_focus',
        title: 'Calm Focus',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
        fallbackUri: 'https://www.soundjay.com/misc/sounds/camera-shutter-click-01.mp3',
        attribution: 'Music by SoundHelix (Free for non-commercial use)',
      },
    ]
  }
];

// Flatten tracks for easier access
const ALL_TRACKS = TRACKS_BY_CATEGORY.flatMap(category => category.tracks);

const PRESETS: { label: string; minutes: number }[] = [
  { label: '10m', minutes: 10 },
  { label: '15m', minutes: 15 },
  { label: '20m', minutes: 20 },
];

export default function MindfulEatingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => themedStyles(theme), [theme]);

  const [totalSeconds, setTotalSeconds] = useState<number>(15 * 60);
  const [remaining, setRemaining] = useState<number>(15 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [trackIdx, setTrackIdx] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<any>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const progress = Math.max(0, Math.min(1, (totalSeconds - remaining) / totalSeconds));
  
  // Animate elements when they appear
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Function to update audio state
  const updateAudioState = useCallback(async () => {
    if (!soundRef.current) return;
    
    try {
      console.log('[MindfulEating] Audio state updated - MusicOn:', musicOn, 'Running:', running);
      
      // Handle music on/off state
      if (!musicOn) {
        console.log('[MindfulEating] Music is off, stopping sound completely');
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          console.log('[MindfulEating] Stopping sound due to music off');
          await soundRef.current.stopAsync();
        }
        // Unload the sound to ensure it's completely stopped
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } else if (running) {
        console.log('[MindfulEating] Music is on and running, ensuring music plays');
        const status = await soundRef.current.getStatusAsync();
        if (!status.isPlaying) {
          console.log('[MindfulEating] Starting music');
          await soundRef.current.playAsync();
        }
      } else {
        // Music is on but not running, stop if playing
        const status = await soundRef.current.getStatusAsync();
        if (status.isPlaying) {
          console.log('[MindfulEating] Stopping music as timer is not running');
          await soundRef.current.stopAsync();
        }
      }
    } catch (e) {
      console.log('[MindfulEating] Error updating audio state', e);
    }
  }, [musicOn, running]);

  const ensureSoundLoaded = useCallback(async () => {
    const { Audio } = await import('expo-av');
    
    // Set audio mode with more comprehensive settings
    await Audio?.setAudioModeAsync?.({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // If we already have a sound loaded, return it
    if (soundRef.current) {
      console.log('[MindfulEating] Using existing sound object');
      return soundRef.current;
    }

    const track = ALL_TRACKS[trackIdx] ?? ALL_TRACKS[0];
    const trackUri = track.uri;
    console.log('[MindfulEating] Loading track:', track.title, trackUri);
    
    // Validate URI before attempting to load
    if (!trackUri) {
      setAudioError('Load failed: No valid URI for track');
      return null;
    }
    
    try {
      // Try to create new sound object with primary URI
      const created = await Audio?.Sound?.createAsync?.(
        { uri: trackUri },
        { 
          isLooping: true, 
          shouldPlay: false // Don't autoplay immediately
        }
      );
      
      const sound = created?.sound;
      if (!sound) {
        throw new Error('Failed to create sound object');
      }
      
      soundRef.current = sound;
      console.log('[MindfulEating] Sound loaded successfully');
      return sound;
    } catch (e: any) {
      console.log('[MindfulEating] Primary URI failed:', e);
      
      // Try fallback URI if available
      if (track.fallbackUri) {
        try {
          console.log('[MindfulEating] Trying fallback URI:', track.fallbackUri);
          const created = await Audio?.Sound?.createAsync?.(
            { uri: track.fallbackUri },
            { 
              isLooping: true, 
              shouldPlay: false
            }
          );
          
          const sound = created?.sound;
          if (sound) {
            soundRef.current = sound;
            console.log('[MindfulEating] Fallback sound loaded successfully');
            setAudioError(''); // Clear any previous error
            return sound;
          }
        } catch (fallbackError: any) {
          console.log('[MindfulEating] Fallback URI also failed:', fallbackError);
        }
      }
      
      // Provide more specific error messages
      let errorMessage = 'Music unavailable';
      if (e.message?.includes('supported source')) {
        errorMessage = 'Audio format not supported';
      } else if (e.message?.includes('network')) {
        errorMessage = 'Network error - check connection';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      setAudioError(`Load failed: ${errorMessage}`);
      return null;
    }
  }, [trackIdx]);

  const reloadTrack = useCallback(async () => {
    try {
      if (soundRef.current?.unloadAsync) {
        console.log('[MindfulEating] Unloading previous sound');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const snd = await ensureSoundLoaded();
      if (!snd) {
        console.log('[MindfulEating] Failed to load sound in reloadTrack');
        return;
      }
      
      if (musicOn && running) {
        try {
          console.log('[MindfulEating] Playing sound in reloadTrack');
          await snd?.playAsync();
          console.log('[MindfulEating] Sound play command sent in reloadTrack');
        } catch (e: any) {
          console.log('[MindfulEating] reload play blocked', e);
          setAudioError(`Playback failed: ${e.message || 'Tap Start to begin music'}`);
        }
      }
    } catch (e: any) {
      console.log('[MindfulEating] reload error', e);
      setAudioError(`Reload failed: ${e.message || 'Unknown error'}`);
    }
  }, [ensureSoundLoaded, musicOn, running]);

  const startMusicIfNeeded = useCallback(async () => {
    if (!musicOn) {
      console.log('[MindfulEating] Music is off, not starting');
      return;
    }
    
    const snd = await ensureSoundLoaded();
    if (!snd) {
      console.log('[MindfulEating] No sound object available');
      setAudioError('Failed to load music');
      return;
    }
    
    try {
      const status: any = await snd?.getStatusAsync?.();
      console.log('[MindfulEating] Sound status:', status);
      
      if (!status?.isPlaying) {
        console.log('[MindfulEating] Playing sound');
        // On web, we might need to handle autoplay policies
        if (Platform.OS === 'web') {
          // For web, we'll show a message to the user about clicking start
          console.log('[MindfulEating] On web platform, waiting for user interaction');
        }
        await snd?.playAsync();
        console.log('[MindfulEating] Sound play command sent');
      }
    } catch (e: any) {
      console.log('[MindfulEating] play error', e);
      // More specific error messages based on platform
      if (Platform.OS === 'web' && e.message?.includes('play')) {
        setAudioError('Autoplay blocked by browser - click Start again');
      } else {
        setAudioError(`Playback failed: ${e.message || 'Unknown error'}`);
      }
    }
  }, [ensureSoundLoaded, musicOn]);

  const stopMusic = useCallback(async () => {
    try {
      if (soundRef.current) {
        console.log('[MindfulEating] Stopping music');
        // First, get the status to see if it's playing
        const status = await soundRef.current.getStatusAsync();
        console.log('[MindfulEating] Music status:', status);
        
        // Stop the music completely
        await soundRef.current.stopAsync();
        console.log('[MindfulEating] Music stopped successfully');
        
        // Unload the sound to ensure it's completely stopped
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        console.log('[MindfulEating] Music unloaded successfully');
      }
    } catch (e) {
      console.log('[MindfulEating] Error stopping music', e);
      // Even if there's an error, ensure soundRef is null
      soundRef.current = null;
    }
  }, []);

  // Function to control music playback based on state
  const controlMusic = useCallback(async () => {
    try {
      if (!musicOn) {
        // Music is off, stop any playing music
        console.log('[MindfulEating] Music is off, stopping any playing music');
        await stopMusic();
        return;
      }
      
      if (!running) {
        // Timer is not running, stop music
        console.log('[MindfulEating] Timer is not running, stopping music');
        await stopMusic();
        return;
      }
      
      // Music is on and timer is running, ensure music is playing
      console.log('[MindfulEating] Music is on and timer is running, ensuring music plays');
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        console.log('[MindfulEating] Current music status:', status);
        if (!status.isPlaying) {
          console.log('[MindfulEating] Starting music');
          await soundRef.current.playAsync();
        }
      } else {
        // No sound loaded, load and play
        const snd = await ensureSoundLoaded();
        if (snd) {
          await snd.playAsync();
        }
      }
    } catch (e) {
      console.log('[MindfulEating] Error controlling music', e);
      // If there's an error, ensure music is stopped
      await stopMusic();
    }
  }, [musicOn, running, stopMusic, ensureSoundLoaded]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      (async () => {
        try {
          await soundRef.current?.unloadAsync?.();
        } catch {}
      })();
    };
  }, []);

  useEffect(() => {
    if (running) {
      startMusicIfNeeded();
      intervalRef.current && clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          const next = Math.max(0, r - 1);
          if (next === 0) {
            setRunning(false);
            stopMusic();
            intervalRef.current && clearInterval(intervalRef.current);
          }
          return next;
        });
      }, 1000);
    } else {
      intervalRef.current && clearInterval(intervalRef.current);
    }
  }, [running, startMusicIfNeeded, stopMusic]);

  useEffect(() => {
    updateAudioState();
  }, [musicOn, running, updateAudioState]);

  useEffect(() => {
    reloadTrack();
  }, [reloadTrack]);

  const setPreset = useCallback((mins: number) => {
    const sec = mins * 60;
    setTotalSeconds(sec);
    setRemaining(sec);
    setRunning(false);
  }, []);

  const toggleRun = useCallback(() => {
    const newRunningState = !running;
    setRunning(newRunningState);
    
    console.log('[MindfulEating] Toggling run state to', newRunningState);
    
    if (newRunningState) {
      // Starting - try to play music if enabled
      if (musicOn) {
        console.log('[MindfulEating] Starting music playback');
        (async () => {
          try {
            const snd = await ensureSoundLoaded();
            if (snd) {
              await snd.playAsync();
              console.log('[MindfulEating] Direct play initiated by user click');
            }
          } catch (e: any) {
            console.log('[MindfulEating] Direct play error', e);
            setAudioError(`Playback failed: ${e.message || 'Click Start again'}`);
          }
        })();
      }
    } else {
      // Stopping - pause music
      console.log('[MindfulEating] Stopping timer and pausing music');
      (async () => {
        try {
          if (soundRef.current) {
            const status = await soundRef.current.getStatusAsync();
            if (status.isPlaying) {
              console.log('[MindfulEating] Pausing currently playing sound');
              await soundRef.current.pauseAsync();
            }
          }
        } catch (e) {
          console.log('[MindfulEating] Error pausing music', e);
        }
      })();
    }
  }, [running, ensureSoundLoaded, musicOn]);

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    setRunning(false);
    stopMusic();
  }, [totalSeconds, stopMusic]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = Math.floor(remaining % 60).toString().padStart(2, '0');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingBottom: insets.bottom }]}>
      <Stack.Screen options={{
        title: 'Mindful Eating',
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.text,
      }} />

      <View style={styles.hero}>
        <CircularProgress size={220} strokeWidth={14} progress={progress} color={theme.colors.primary700} backgroundColor={theme.colors.accent}>
          <Text style={styles.timeText} testID="mindful-time">{mins}:{secs}</Text>
          <Text style={styles.timeLabel}>Slow • small bites • breathe</Text>
        </CircularProgress>
      </View>

      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[styles.pill, (totalSeconds === p.minutes * 60) ? styles.pillActive : undefined]}
            onPress={() => setPreset(p.minutes)}
            testID={`preset-${p.minutes}`}
          >
            <Clock size={16} color={totalSeconds === p.minutes * 60 ? theme.colors.primary700 : theme.colors.text} />
            <Text style={[styles.pillText, (totalSeconds === p.minutes * 60) ? styles.pillTextActive : undefined]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={toggleRun} style={[styles.primaryBtn, running ? styles.pauseBtn : undefined]} testID="toggle-run">
          {running ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
          <Text style={styles.primaryBtnText}>{running ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={styles.resetBtn} testID="reset">
          <RotateCcw size={16} color={theme.colors.primary700} />
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: 'rgba(148, 163, 184, 0.2)', marginVertical: 20, marginHorizontal: 20 }} />
      
      {/* Luxury Music Control Section */}
      <Animated.View style={[styles.luxuryMusicSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        
        {/* Music Toggle with Luxury Styling */}
        <TouchableOpacity 
          onPress={async () => {
            const newMusicState = !musicOn;
            console.log('[MindfulEating] Toggling music to', newMusicState);
            setMusicOn(newMusicState);
            
            // Add a small animation effect
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
              })
            ]).start();
            
            // If turning music off, stop it immediately and forcefully
            if (!newMusicState) {
              console.log('[MindfulEating] Forcefully stopping music');
              // Force stop any playing music
              if (soundRef.current) {
                try {
                  const status = await soundRef.current.getStatusAsync();
                  if (status.isPlaying) {
                    await soundRef.current.stopAsync();
                  }
                  await soundRef.current.unloadAsync();
                } catch (e) {
                  console.log('[MindfulEating] Error force stopping music', e);
                } finally {
                  soundRef.current = null;
                }
              }
            }
            
            // Always call controlMusic to handle the state properly
            controlMusic();
          }} 
          style={[styles.luxuryToggle, musicOn ? styles.luxuryToggleActive : undefined, { transform: [{ scale: scaleAnim }] }]} 
          testID="toggle-music"
        >
          <Music2 size={24} color={musicOn ? '#FFFFFF' : theme.colors.text} />
          <Text style={[styles.luxuryToggleText, musicOn ? styles.luxuryToggleTextActive : undefined]}>
            {musicOn ? 'Music Running' : 'Music Stopped'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: 'rgba(148, 163, 184, 0.2)', marginVertical: 20, marginHorizontal: 20 }} />
      
      {/* Luxury Categorized Track Selection - Pixabay Style */}
      <Animated.View style={[styles.luxuryTracksContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        
        {/* Tracks by Category - Pixabay Style */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
          {TRACKS_BY_CATEGORY.map((category, categoryIndex) => (
            <View key={categoryIndex} style={[styles.luxuryCategoryContainer, { marginRight: 16, minWidth: 300 }]}>
              <Text style={styles.luxuryCategoryTitle}>{category.category}</Text>
              <View style={styles.luxuryCategoryTracks}>
                {category.tracks.map((track, trackIndex) => {
                  // Find the global index for this track
                  const globalIndex = ALL_TRACKS.findIndex(t => t.id === track.id);
                  return (
                    <TouchableOpacity
                      key={track.id}
                      style={[
                        styles.luxuryTrackItem, 
                        globalIndex === trackIdx ? styles.luxuryTrackItemActive : undefined
                      ]}
                      onPress={() => setTrackIdx(globalIndex)}
                      testID={`track-${track.id}`}
                    >
                      <Text style={[styles.luxuryTrackItemText, globalIndex === trackIdx ? styles.luxuryTrackItemTextActive : undefined]}>
                        {track.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        
        {/* Currently Selected Track */}
        <View style={styles.luxuryCurrentTrackContainer}>
          <Text style={styles.luxuryCurrentTrackTitle}>{ALL_TRACKS[trackIdx]?.title}</Text>
          <Text style={styles.luxuryCurrentTrackAttribution}>{ALL_TRACKS[trackIdx]?.attribution}</Text>
        </View>
      </Animated.View>

      {/* Attribution is now shown in the luxury current track section */}

      {audioError && <Text style={[styles.errorText]}>{audioError}</Text>}

      {Platform.OS === 'web' && (
        <Text style={styles.luxuryHintText}>On web, browsers may block autoplay. If music doesn’t start, press Start again. The first click enables audio.</Text>
      )}
    </View>
  );
}

const themedStyles = (Theme: any) => StyleSheet.create({
  container: { flex: 1 },
  hero: { alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 20 },
  timeText: { fontSize: 42, fontWeight: '800', color: Theme.colors.text, letterSpacing: -0.5 },
  timeLabel: { fontSize: 12, color: Theme.colors.textMuted, marginTop: 6 },
  presetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20, marginTop: 8, marginBottom: 16, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border, minWidth: 120, justifyContent: 'center' },
  pillActive: { backgroundColor: '#EEF4FF', borderColor: Theme.colors.primary700 },
  pillText: { fontSize: 14, color: Theme.colors.text, fontWeight: '700' },
  pillTextActive: { color: Theme.colors.primary700 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginTop: 4 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Theme.colors.primary700, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, flex: 1 },
  pauseBtn: { backgroundColor: '#111827' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  resetText: { color: Theme.colors.primary700, fontSize: 14, fontWeight: '700' },
  musicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 16 },
  volumeGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  minorBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  volumeText: { color: Theme.colors.text, fontSize: 16, fontWeight: '700', minWidth: 60, textAlign: 'center', lineHeight: 24 },

  attributionText: { fontSize: 11, color: Theme.colors.textMuted, textAlign: 'center', marginTop: 6 },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  hintText: { color: Theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },

  
  // Luxury Music Styles
  luxuryMusicSection: { paddingHorizontal: 20, marginTop: 20 },
  luxurySectionTitle: { fontSize: 20, fontWeight: '800', color: Theme.colors.text, marginBottom: 20, textAlign: 'center', letterSpacing: 0.5 },
  luxuryToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 18, paddingHorizontal: 24, borderRadius: 16, backgroundColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  luxuryToggleActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  luxuryToggleText: { fontSize: 16, fontWeight: '700', color: Theme.colors.text },
  luxuryToggleTextActive: { color: '#FFFFFF' },
  luxuryVolumeContainer: { marginTop: 24, paddingHorizontal: 16, paddingVertical: 20, backgroundColor: 'rgba(148, 163, 184, 0.05)', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  luxuryVolumeLabel: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 16, textAlign: 'center' },
  luxuryVolumeControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  luxuryVolumeButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(148, 163, 184, 0.15)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.25)', justifyContent: 'center', alignItems: 'center' },
  luxuryVolumeSliderContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  luxuryVolumeTrack: { height: 8, borderRadius: 4, backgroundColor: '#0ea5e9' },
  luxuryVolumeText: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, minWidth: 60, textAlign: 'center' },
  
  // Luxury Track Selection Styles - Pixabay Inspired
  luxuryTracksContainer: { marginTop: 30, paddingHorizontal: 16 },
  luxuryCategoryContainer: { width: '100%', marginBottom: 28, backgroundColor: 'rgba(148, 163, 184, 0.03)', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2 },
  luxuryCategoryTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text, marginBottom: 16, textAlign: 'left', paddingHorizontal: 8, letterSpacing: 0.3 },
  luxuryCategoryTracks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  luxuryTrackItem: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(148, 163, 184, 0.1)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.15)', minWidth: 140, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  luxuryTrackItemActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  luxuryTrackItemText: { fontSize: 15, fontWeight: '600', color: Theme.colors.text },
  luxuryTrackItemTextActive: { color: '#FFFFFF' },
  luxuryCurrentTrackContainer: { marginTop: 24, alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'rgba(148, 163, 184, 0.05)', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  luxuryCurrentTrackTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text, textAlign: 'center' },
  luxuryCurrentTrackAttribution: { fontSize: 13, color: Theme.colors.textMuted, textAlign: 'center', marginTop: 8, fontStyle: 'italic' },
  luxuryHintText: { color: Theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 20, paddingHorizontal: 20, fontStyle: 'italic' },
});
