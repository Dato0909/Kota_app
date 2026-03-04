import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadVocab, addVocab, deleteVocab } from '../utils/storage';
import type { Vocabulary } from '../types';

// ─── Layout constants ─────────────────────────────────────────────────────────

const CARD_GAP = 10;
const SIDE_PAD = 16;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_PAD * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = 130;

// ─── VocabCard (grid, tappable flip) ─────────────────────────────────────────

function VocabCard({
  vocab,
  onDelete,
}: {
  vocab: Vocabulary;
  onDelete: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontRotate = anim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = anim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  function handlePress() {
    const toValue = flipped ? 0 : 180;
    Animated.spring(anim, { toValue, friction: 8, tension: 40, useNativeDriver: true }).start();
    setFlipped((f) => !f);
  }

  function handleLongPress() {
    Alert.alert('削除', `「${vocab.word}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: onDelete },
    ]);
  }

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.95}
    >
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
        ]}
      >
        <Text style={styles.cardWord} numberOfLines={3}>
          {vocab.word}
        </Text>
        <Text style={styles.cardTapHint}>タップ ↑</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
        ]}
      >
        <Text style={styles.cardMeaning} numberOfLines={3}>
          {vocab.meaning}
        </Text>
        {vocab.example ? (
          <Text style={styles.cardExample} numberOfLines={2}>
            {vocab.example}
          </Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── StudyCard (study mode, resets per card via key) ─────────────────────────

function StudyCard({ vocab }: { vocab: Vocabulary }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const frontRotate = anim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = anim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  function handlePress() {
    const toValue = flipped ? 0 : 180;
    Animated.spring(anim, { toValue, friction: 8, tension: 40, useNativeDriver: true }).start();
    setFlipped((f) => !f);
  }

  return (
    <TouchableOpacity style={styles.studyCardContainer} onPress={handlePress} activeOpacity={0.95}>
      <Animated.View
        style={[
          styles.studyCard,
          styles.cardFront,
          { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] },
        ]}
      >
        <Text style={styles.studyWord}>{vocab.word}</Text>
        <Text style={styles.studyHint}>タップして意味を確認</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.studyCard,
          styles.cardBack,
          { transform: [{ perspective: 1200 }, { rotateY: backRotate }] },
        ]}
      >
        <Text style={styles.studyMeaning}>{vocab.meaning}</Text>
        {vocab.example ? (
          <Text style={styles.studyExample}>{vocab.example}</Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Add Modal ────────────────────────────────────────────────────────────────

function AddModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (word: string, meaning: string, example: string) => void;
}) {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');

  function handleSave() {
    if (!word.trim() || !meaning.trim()) {
      Alert.alert('入力エラー', '英単語と意味は必須です');
      return;
    }
    onSave(word.trim(), meaning.trim(), example.trim());
    setWord('');
    setMeaning('');
    setExample('');
  }

  function handleClose() {
    setWord('');
    setMeaning('');
    setExample('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalSafe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>単語を追加</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>
              英単語・フレーズ <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="例: remarkable"
              placeholderTextColor="#C7C7CC"
              value={word}
              onChangeText={setWord}
              autoCapitalize="none"
              autoFocus
            />

            <Text style={styles.inputLabel}>
              意味 <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="例: 注目すべき、驚くべき"
              placeholderTextColor="#C7C7CC"
              value={meaning}
              onChangeText={setMeaning}
            />

            <Text style={styles.inputLabel}>例文（任意）</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="例: That was a remarkable achievement."
              placeholderTextColor="#C7C7CC"
              value={example}
              onChangeText={setExample}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存する</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FlashcardScreen() {
  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadVocab().then(setVocabs);
    }, [])
  );

  async function handleSave(word: string, meaning: string, example: string) {
    const vocab: Vocabulary = {
      id: Date.now().toString(),
      word,
      meaning,
      example: example || undefined,
      createdAt: new Date().toISOString(),
    };
    await addVocab(vocab);
    setVocabs((prev) => [vocab, ...prev]);
    setShowAdd(false);
  }

  async function handleDelete(id: string) {
    await deleteVocab(id);
    setVocabs((prev) => prev.filter((v) => v.id !== id));
  }

  function startStudy() {
    setStudyIndex(0);
    setStudyMode(true);
  }

  const currentVocab = vocabs[studyIndex];

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>マイ単語帳</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>＋ 追加</Text>
        </TouchableOpacity>
      </View>

      {vocabs.length === 0 ? (
        /* ── Empty state ── */
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyTitle}>単語がまだありません</Text>
          <Text style={styles.emptySub}>「＋ 追加」から英単語を登録しよう</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.emptyAddBtnText}>最初の単語を追加する</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ── Study start button ── */}
          <TouchableOpacity style={styles.studyStartBtn} onPress={startStudy}>
            <Text style={styles.studyStartText}>▶ 学習スタート（{vocabs.length}語）</Text>
          </TouchableOpacity>

          {/* ── Card grid ── */}
          <FlatList
            data={vocabs}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.gridRow}
            renderItem={({ item }) => (
              <VocabCard vocab={item} onDelete={() => handleDelete(item.id)} />
            )}
          />
        </>
      )}

      {/* ── Add Modal ── */}
      <AddModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />

      {/* ── Study Mode Modal ── */}
      <Modal
        visible={studyMode}
        animationType="slide"
        onRequestClose={() => setStudyMode(false)}
      >
        <SafeAreaView style={styles.studySafe}>
          <View style={styles.studyHeader}>
            <TouchableOpacity onPress={() => setStudyMode(false)}>
              <Text style={styles.studyClose}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.studyProgress}>
              {studyIndex + 1} / {vocabs.length}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          {/* Progress bar */}
          <View style={styles.studyProgressTrack}>
            <View
              style={[
                styles.studyProgressFill,
                { width: `${((studyIndex + 1) / vocabs.length) * 100}%` },
              ]}
            />
          </View>

          <View style={styles.studyBody}>
            {currentVocab && <StudyCard key={studyIndex} vocab={currentVocab} />}
          </View>

          <View style={styles.studyNav}>
            <TouchableOpacity
              style={[styles.navBtn, studyIndex === 0 && styles.navBtnDisabled]}
              onPress={() => setStudyIndex((i) => Math.max(0, i - 1))}
              disabled={studyIndex === 0}
            >
              <Text style={[styles.navBtnText, studyIndex === 0 && styles.navBtnTextDisabled]}>
                ◀ 前へ
              </Text>
            </TouchableOpacity>

            {studyIndex === vocabs.length - 1 ? (
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnFinish]}
                onPress={() => setStudyMode(false)}
              >
                <Text style={styles.navBtnFinishText}>完了 ✓</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => setStudyIndex((i) => Math.min(vocabs.length - 1, i + 1))}
              >
                <Text style={styles.navBtnText}>次へ ▶</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F7' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PAD,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Study start button
  studyStartBtn: {
    margin: SIDE_PAD,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  studyStartText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Grid
  grid: { paddingHorizontal: SIDE_PAD, paddingBottom: 32 },
  gridRow: { gap: CARD_GAP, marginBottom: CARD_GAP },

  // Card (shared)
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardFront: { backgroundColor: '#fff' },
  cardBack: { backgroundColor: '#F0F4FF' },
  cardWord: {
    fontSize: 17,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardTapHint: { fontSize: 10, color: '#C7C7CC' },
  cardMeaning: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardExample: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  emptySub: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  emptyAddBtn: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyAddBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // Add Modal
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  modalClose: { fontSize: 18, color: '#8E8E93', padding: 4 },
  modalContent: { padding: 20, gap: 6 },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 4,
  },
  required: { color: '#FF3B30' },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  inputMultiline: { height: 80, paddingTop: 12 },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Study Mode
  studySafe: { flex: 1, backgroundColor: '#F2F2F7' },
  studyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  studyClose: { fontSize: 18, color: '#8E8E93', padding: 4 },
  studyProgress: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  studyProgressTrack: {
    height: 3,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  studyProgressFill: {
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  studyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  studyCardContainer: {
    width: '100%',
    height: 280,
  },
  studyCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  studyWord: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  studyHint: { fontSize: 13, color: '#C7C7CC' },
  studyMeaning: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 14,
  },
  studyExample: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  studyNav: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  navBtnTextDisabled: { color: '#C7C7CC' },
  navBtnFinish: { backgroundColor: '#34C759', borderColor: '#34C759' },
  navBtnFinishText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
