import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TopicCard from '../components/TopicCard';
import { loadPosts, isToday } from '../utils/storage';
import { getTodaysTopic } from '../data/topics';
import type { Post } from '../types';
import type { HomeStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [posts, setPosts] = useState<Post[]>([]);
  const topic = getTodaysTopic();

  useFocusEffect(
    useCallback(() => {
      loadPosts().then(setPosts);
    }, [])
  );

  const todaysPost = posts.find((p) => isToday(p.createdAt));
  const pastPosts = posts.filter((p) => !isToday(p.createdAt));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appTitle}>Gengo</Text>

        <TopicCard topic={topic} />

        {todaysPost ? (
          <CompletedCard post={todaysPost} />
        ) : (
          <PostPromptCard onPress={() => navigation.navigate('Post')} />
        )}

        {pastPosts.length > 0 && <PostHistory posts={pastPosts.slice(0, 10)} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function PostPromptCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.promptCard} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.promptIcon}>✏️</Text>
      <View style={styles.promptText}>
        <Text style={styles.promptTitle}>今日の1文を書く</Text>
        <Text style={styles.promptSub}>1〜2文でOK。今日できることをやろう</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function CompletedCard({ post }: { post: Post }) {
  return (
    <View style={styles.completedCard}>
      <View style={styles.completedHeader}>
        <Text style={styles.checkIcon}>✅</Text>
        <Text style={styles.completedTitle}>今日の投稿が完了しました</Text>
      </View>
      {post.photoUri && (
        <Image source={{ uri: post.photoUri }} style={styles.postImage} resizeMode="cover" />
      )}
      <View style={styles.postTextBox}>
        <Text style={styles.postText}>{post.text}</Text>
      </View>
      <Text style={styles.tomorrowNote}>明日のお題をお楽しみに</Text>
    </View>
  );
}

function PostHistory({ posts }: { posts: Post[] }) {
  return (
    <View style={styles.historySection}>
      <Text style={styles.historyTitle}>これまでの投稿</Text>
      {posts.map((post) => (
        <View key={post.id} style={styles.historyRow}>
          <Text style={styles.historyTopic}>{post.topicPrompt}</Text>
          <Text style={styles.historyText}>{post.text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  // Post prompt card
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  promptIcon: {
    fontSize: 22,
  },
  promptText: {
    flex: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  promptSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  // Completed card
  completedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.3)',
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    fontSize: 18,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  postImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
  },
  postTextBox: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
  },
  postText: {
    fontSize: 15,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  tomorrowNote: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  // History
  historySection: {
    gap: 10,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  historyRow: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  historyTopic: {
    fontSize: 12,
    color: '#8E8E93',
  },
  historyText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
});
