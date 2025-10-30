import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import CircularProgress from '@/components/CircularProgress';
import { Play, Pause, Clock, Music2, Volume2, VolumeX, RotateCcw } from 'lucide-react-native';


type Track = { id: string; title: string; uri: string; attribution: string };

const TRACKS: Track[] = [
  {
    id: 'calm_meditation',
    title: 'Calm Meditation',
    uri: 'https://cdn.pixabay.com/download/audio/2022/03/14/audio_9da0a8c0c7.mp3?filename=calm-meditation-110624.mp3',
    attribution: 'Music by Lesfm from Pixabay',
  },
  {
    id: 'soft_piano',
    title: 'Soft Piano',
    uri: 'https://cdn.pixabay.com/download/audio/2021/10/15/audio_0f3f1e1b3a.mp3?filename=relaxing-piano-100532.mp3',
    attribution: 'Music by Keys of Moon from Pixabay',
  },
  {
    id: 'deep_focus',
    title: 'Deep Focus',
    uri: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_4a8e2c2ee0.mp3?filename=deep-relaxation-11157.mp3',
    attribution: 'Music by Music For Videos from Pixabay',
  },
];

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
  const [volume, setVolume] = useState<number>(0.4);
  const [trackIdx, setTrackIdx] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<any>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const progress = Math.max(0, Math.min(1, (totalSeconds - remaining) / totalSeconds));

  const ensureSoundLoaded = useCallback(async () => {
    try {
      const { Audio } = await import('expo-av');
      const AudioMod = Audio;
      await AudioMod?.setAudioModeAsync?.({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (soundRef.current) {
        return soundRef.current;
      }

      const created = await AudioMod?.Sound?.createAsync?.(
        { uri: TRACKS[trackIdx]?.uri ?? TRACKS[0].uri },
        { isLooping: true, volume }
      );
      const sound = created?.sound;
      soundRef.current = sound;
      return sound;
    } catch (e: any) {
      console.log('[MindfulEating] audio load error', e);
      setAudioError('Music unavailable');
      return null;
    }
  }, [trackIdx, volume]);

  const reloadTrack = useCallback(async () => {
    try {
      if (soundRef.current?.unloadAsync) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const snd = await ensureSoundLoaded();
      await snd?.setVolumeAsync(volume);
      if (musicOn && running) {
        try {
          await snd?.playAsync();
        } catch (e) {
          console.log('[MindfulEating] reload play blocked', e);
          setAudioError('Tap Start to begin music');
        }
      }
    } catch (e) {
      console.log('[MindfulEating] reload error', e);
    }
  }, [ensureSoundLoaded, musicOn, running, volume]);

  const startMusicIfNeeded = useCallback(async () => {
    if (!musicOn) return;
    const snd = await ensureSoundLoaded();
    try {
      await snd?.setVolumeAsync(volume);
      const status: any = await snd?.getStatusAsync?.();
      if (!status?.isPlaying) {
        await snd?.playAsync();
      }
    } catch (e) {
      console.log('[MindfulEating] play error', e);
      setAudioError('Autoplay blocked — tap Start to start');
    }
  }, [ensureSoundLoaded, musicOn, volume]);

  const stopMusic = useCallback(async () => {
    try {
      await soundRef.current?.pauseAsync?.();
    } catch {}
  }, []);

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
    if (!soundRef.current) return;
    (async () => {
      try {
        await soundRef.current?.setVolumeAsync(volume);
        if (!musicOn) {
          await soundRef.current?.pauseAsync?.();
        } else if (running) {
          await startMusicIfNeeded();
        }
      } catch (e) {
        console.log('[MindfulEating] volume/toggle error', e);
      }
    })();
  }, [volume, musicOn, running, startMusicIfNeeded]);

  useEffect(() => {
    reloadTrack();
  }, [trackIdx, reloadTrack]);

  const setPreset = useCallback((mins: number) => {
    const sec = mins * 60;
    setTotalSeconds(sec);
    setRemaining(sec);
    setRunning(false);
  }, []);

  const toggleRun = useCallback(() => {
    setRunning((v) => !v);
  }, []);

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    setRunning(false);
    stopMusic();
  }, [totalSeconds, stopMusic]);

  const incVolume = useCallback(() => setVolume((v) => Math.min(1, Math.round((v + 0.1) * 10) / 10)), []);
  const decVolume = useCallback(() => setVolume((v) => Math.max(0, Math.round((v - 0.1) * 10) / 10)), []);

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

      <View style={styles.musicRow}>
        <TouchableOpacity onPress={() => setMusicOn((v) => !v)} style={[styles.pill, musicOn ? styles.pillActive : undefined]} testID="toggle-music">
          <Music2 size={16} color={musicOn ? theme.colors.primary700 : theme.colors.text} />
          <Text style={[styles.pillText, musicOn ? styles.pillTextActive : undefined]}>{musicOn ? 'Music on' : 'Music off'}</Text>
        </TouchableOpacity>

        <View style={styles.volumeGroup}>
          <TouchableOpacity onPress={decVolume} style={styles.minorBtn} testID="vol-down">
            <VolumeX size={16} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
          <TouchableOpacity onPress={incVolume} style={styles.minorBtn} testID="vol-up">
            <Volume2 size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tracksRow}>
        {TRACKS.map((t, i) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.trackPill, i === trackIdx ? styles.trackPillActive : undefined]}
            onPress={() => setTrackIdx(i)}
            testID={`track-${t.id}`}
          >
            <Text style={[styles.trackText, i === trackIdx ? styles.trackTextActive : undefined]}>{t.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.attributionText} numberOfLines={1}>Source: {TRACKS[trackIdx]?.attribution}</Text>

      {audioError && <Text style={[styles.errorText]}>{audioError}</Text>}

      {Platform.OS === 'web' && (
        <Text style={styles.hintText}>On web, browsers may block autoplay. If music doesn’t start, press Start once.</Text>
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
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
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
  volumeGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  minorBtn: { paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface },
  volumeText: { color: Theme.colors.text, fontSize: 14, fontWeight: '700', minWidth: 44, textAlign: 'center' },
  tracksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  trackPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Theme.colors.surface, borderWidth: 1, borderColor: Theme.colors.border },
  trackPillActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  trackText: { fontSize: 12, color: Theme.colors.textMuted, fontWeight: '700' },
  trackTextActive: { color: '#047857' },
  attributionText: { fontSize: 11, color: Theme.colors.textMuted, textAlign: 'center', marginTop: 6 },
  errorText: { color: '#EF4444', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  hintText: { color: Theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
});
