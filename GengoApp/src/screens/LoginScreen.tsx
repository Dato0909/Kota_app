import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('入力エラー', 'ニックネームを入力してください');
      return;
    }
    setLoading(true);
    await login(trimmed);
    // Navigation is handled automatically by RootNavigator when user state updates
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Brand area ── */}
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>📝</Text>
          <Text style={styles.brandName}>Gengo</Text>
          <Text style={styles.brandTagline}>毎日1文、英語で書こう</Text>
        </View>

        {/* ── Form area ── */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>はじめよう</Text>
          <Text style={styles.formSub}>あなたのニックネームを入力してください</Text>

          <TextInput
            style={styles.input}
            placeholder="例：Taro, 学習中のYuki..."
            placeholderTextColor="#C7C7CC"
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
          <Text style={styles.charCount}>{name.trim().length} / 20</Text>

          <TouchableOpacity
            style={[styles.startButton, !name.trim() && styles.startButtonDisabled]}
            onPress={handleStart}
            disabled={!name.trim() || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.startButtonText}>
              {loading ? '設定中...' : 'はじめる →'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Footer note ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ※ データはこの端末のみに保存されます
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },

  // Brand
  brand: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 20,
  },
  brandIcon: { fontSize: 64 },
  brandName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: -1,
  },
  brandTagline: { fontSize: 16, color: '#8E8E93', fontWeight: '500' },

  // Form
  form: {
    paddingHorizontal: 28,
    gap: 8,
    paddingBottom: 8,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  formSub: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 16,
    fontSize: 17,
    color: '#1C1C1E',
    marginTop: 4,
  },
  charCount: { fontSize: 12, color: '#C7C7CC', textAlign: 'right', marginTop: 2 },
  startButton: {
    marginTop: 12,
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonDisabled: { backgroundColor: '#C7C7CC' },
  startButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Footer
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: { fontSize: 12, color: '#C7C7CC' },
});
