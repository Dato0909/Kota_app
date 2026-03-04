import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, Vocabulary } from '../types';

const POSTS_KEY = 'gengo_posts';

export async function loadPosts(): Promise<Post[]> {
  try {
    const json = await AsyncStorage.getItem(POSTS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function savePost(post: Post): Promise<void> {
  const posts = await loadPosts();
  posts.unshift(post);
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/** 日付を "YYYY-MM-DD" 形式に正規化 */
function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ─── Vocabulary storage ───────────────────────────────────────────────────────

const VOCAB_KEY = 'gengo_vocab';

export async function loadVocab(): Promise<Vocabulary[]> {
  try {
    const json = await AsyncStorage.getItem(VOCAB_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function addVocab(vocab: Vocabulary): Promise<void> {
  const list = await loadVocab();
  list.unshift(vocab);
  await AsyncStorage.setItem(VOCAB_KEY, JSON.stringify(list));
}

export async function deleteVocab(id: string): Promise<void> {
  const list = await loadVocab();
  const filtered = list.filter((v) => v.id !== id);
  await AsyncStorage.setItem(VOCAB_KEY, JSON.stringify(filtered));
}

/**
 * 投稿リストから現在の連続投稿日数（ストリーク）を計算する。
 * 今日または昨日まで連続していればカウントを継続する。
 */
export function calcStreak(posts: Post[]): number {
  if (posts.length === 0) return 0;

  const postedDays = new Set(posts.map((p) => toDateKey(new Date(p.createdAt))));

  let streak = 0;
  const cursor = new Date();

  // 今日投稿がない場合は昨日から遡る
  if (!postedDays.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (postedDays.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
