import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post } from '../types';

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
