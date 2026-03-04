import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';

// ─── Types ────────────────────────────────────────────────────────────────────

type RecorderState = 'idle' | 'recording' | 'stopped' | 'playing';

interface Props {
  onRecordingChange: (uri: string | null) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VoiceRecorder({ onRecordingChange }: Props) {
  const [state, setState] = useState<RecorderState>('idle');
  const [elapsed, setElapsed] = useState(0);   // seconds (recording duration)
  const [uri, setUri] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulsing animation for recording indicator
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  function startPulse() {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  }

  function stopPulse() {
    pulseLoop.current?.stop();
    pulse.setValue(1);
  }

  async function startRecording() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('許可が必要です', 'マイクへのアクセスを許可してください。');
      return;
    }

    // Unload any previous sound
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    recordingRef.current = recording;
    setElapsed(0);
    setState('recording');
    startPulse();

    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  }

  async function stopRecording() {
    if (!recordingRef.current) return;

    timerRef.current && clearInterval(timerRef.current);
    stopPulse();

    try {
      await recordingRef.current.stopAndUnloadAsync();
    } catch {
      // already stopped
    }

    // Switch back to playback mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const recordingUri = recordingRef.current.getURI() ?? null;
    recordingRef.current = null;

    setUri(recordingUri);
    setState('stopped');
    onRecordingChange(recordingUri);
  }

  async function playRecording() {
    if (!uri) return;
    setState('playing');

    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setState('stopped');
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      await sound.playAsync();
    } catch {
      Alert.alert('エラー', '再生できませんでした。');
      setState('stopped');
    }
  }

  async function stopPlaying() {
    await soundRef.current?.stopAsync();
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setState('stopped');
  }

  function deleteRecording() {
    Alert.alert('削除', '録音を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          setUri(null);
          setElapsed(0);
          setState('idle');
          onRecordingChange(null);
        },
      },
    ]);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (state === 'idle') {
    return (
      <TouchableOpacity style={styles.idleButton} onPress={startRecording} activeOpacity={0.8}>
        <Text style={styles.micIcon}>🎤</Text>
        <Text style={styles.idleText}>音読を録音する（任意）</Text>
      </TouchableOpacity>
    );
  }

  if (state === 'recording') {
    return (
      <View style={styles.recordingBox}>
        <View style={styles.recordingLeft}>
          <Animated.View style={[styles.recordDot, { transform: [{ scale: pulse }] }]} />
          <Text style={styles.recordingLabel}>録音中</Text>
        </View>
        <Text style={styles.durationText}>{formatDuration(elapsed)}</Text>
        <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
          <Text style={styles.stopBtnText}>⬛ 停止</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // state === 'stopped' | 'playing'
  return (
    <View style={styles.stoppedBox}>
      <Text style={styles.micIconSmall}>🎤</Text>
      <Text style={styles.durationText}>{formatDuration(elapsed)}</Text>
      <View style={styles.stoppedActions}>
        {state === 'playing' ? (
          <TouchableOpacity style={styles.actionBtn} onPress={stopPlaying}>
            <Text style={styles.actionBtnText}>⬛</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={playRecording}>
            <Text style={styles.actionBtnText}>▶</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.reRecordBtn]} onPress={startRecording}>
          <Text style={styles.actionBtnText}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={deleteRecording}>
          <Text style={styles.actionBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Idle
  idleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  micIcon: { fontSize: 20 },
  idleText: { fontSize: 15, color: '#8E8E93' },

  // Recording
  recordingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 12,
  },
  recordingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  recordDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  recordingLabel: { fontSize: 14, fontWeight: '600', color: '#FF3B30' },
  durationText: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', minWidth: 36 },
  stopBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stopBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  // Stopped / playing
  stoppedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
    gap: 10,
  },
  micIconSmall: { fontSize: 16 },
  stoppedActions: { flexDirection: 'row', gap: 8, marginLeft: 'auto' },
  actionBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reRecordBtn: { backgroundColor: '#FF9F0A' },
  deleteBtn: { backgroundColor: '#FF3B30' },
  actionBtnText: { fontSize: 14 },
});
