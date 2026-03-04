import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadPosts, calcStreak } from '../utils/storage';
import type { Post } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Badge {
  id: string;
  icon: string;
  label: string;
  desc: string;
  earned: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  name: 'Gengo User',
  level: 1,
  levelName: 'Beginner',
};

function buildBadges(totalPosts: number, streak: number): Badge[] {
  return [
    {
      id: 'first_post',
      icon: '🌱',
      label: '初投稿',
      desc: '最初の一文を投稿した',
      earned: totalPosts >= 1,
    },
    {
      id: 'streak_3',
      icon: '🔥',
      label: '3日連続',
      desc: '3日連続で投稿した',
      earned: streak >= 3,
    },
    {
      id: 'posts_7',
      icon: '✏️',
      label: '7投稿',
      desc: '7本の英文を投稿した',
      earned: totalPosts >= 7,
    },
    {
      id: 'streak_7',
      icon: '💪',
      label: '1週間連続',
      desc: '7日連続で投稿した',
      earned: streak >= 7,
    },
    {
      id: 'posts_30',
      icon: '🌟',
      label: '30投稿',
      desc: '30本の英文を投稿した',
      earned: totalPosts >= 30,
    },
    {
      id: 'streak_30',
      icon: '👑',
      label: '30日連続',
      desc: '30日連続で投稿した',
      earned: streak >= 30,
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BadgePill({ badge }: { badge: Badge }) {
  return (
    <View style={[styles.badgePill, !badge.earned && styles.badgePillLocked]}>
      <Text style={[styles.badgeIcon, !badge.earned && styles.badgeIconLocked]}>
        {badge.earned ? badge.icon : '🔒'}
      </Text>
      <Text style={[styles.badgeLabel, !badge.earned && styles.badgeLabelLocked]}>
        {badge.label}
      </Text>
    </View>
  );
}

function PostRow({ post }: { post: Post }) {
  return (
    <View style={styles.postRow}>
      {post.photoUri ? (
        <Image source={{ uri: post.photoUri }} style={styles.postThumb} />
      ) : (
        <View style={styles.postThumbPlaceholder}>
          <Text style={styles.postThumbIcon}>✏️</Text>
        </View>
      )}
      <View style={styles.postRowBody}>
        <Text style={styles.postRowText} numberOfLines={2}>
          {post.text}
        </Text>
        <Text style={styles.postRowTopic} numberOfLines={1}>
          {post.topicPrompt}
        </Text>
      </View>
      <Text style={styles.postRowDate}>{formatDate(post.createdAt)}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadPosts().then(setPosts);
    }, [])
  );

  const streak = calcStreak(posts);
  const totalPosts = posts.length;
  const badges = buildBadges(totalPosts, streak);
  const earnedCount = badges.filter((b) => b.earned).length;

  const levelThresholds = [0, 10, 30, 60];
  const nextThreshold = levelThresholds[MOCK_USER.level] ?? null;
  const progressRatio = nextThreshold ? Math.min(totalPosts / nextThreshold, 1) : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── ヘッダー ── */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {MOCK_USER.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{MOCK_USER.name}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>
              Lv.{MOCK_USER.level} {MOCK_USER.levelName}
            </Text>
          </View>
        </View>

        {/* ── レベル進捗バー ── */}
        {nextThreshold !== null && (
          <View style={styles.section}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>次のレベルまで</Text>
              <Text style={styles.progressCount}>
                {totalPosts} / {nextThreshold} 投稿
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
          </View>
        )}

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard value={streak} label="連続投稿" icon="🔥" />
          <StatCard value={totalPosts} label="総投稿数" icon="✏️" />
          <StatCard value={earnedCount} label="バッジ" icon="🏅" />
        </View>

        {/* ── バッジ ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>バッジ</Text>
          <View style={styles.badgeGrid}>
            {badges.map((badge) => (
              <BadgePill key={badge.id} badge={badge} />
            ))}
          </View>
        </View>

        {/* ── 投稿履歴 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投稿履歴</Text>
          {posts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>まだ投稿がありません</Text>
              <Text style={styles.emptySubText}>1日1文から始めよう</Text>
            </View>
          ) : (
            posts.slice(0, 20).map((post) => (
              <PostRow key={post.id} post={post} />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  levelBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
  },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },

  // Badges
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F2F9FF',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgePillLocked: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  badgeIcon: {
    fontSize: 15,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
  badgeLabelLocked: {
    color: '#C7C7CC',
  },

  // Post history
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  postThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  postThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
  },
  postThumbIcon: {
    fontSize: 20,
  },
  postRowBody: {
    flex: 1,
    gap: 2,
  },
  postRowText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 19,
  },
  postRowTopic: {
    fontSize: 12,
    color: '#8E8E93',
  },
  postRowDate: {
    fontSize: 12,
    color: '#C7C7CC',
    flexShrink: 0,
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  emptySubText: {
    fontSize: 13,
    color: '#C7C7CC',
  },
});
