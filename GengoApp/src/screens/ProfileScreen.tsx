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

// ─── Rank definitions ─────────────────────────────────────────────────────────

interface Rank {
  level: number;
  icon: string;
  name: string;        // English
  nameJa: string;      // 日本語
  requiredPosts: number;
  color: string;       // accent color
  bgColor: string;     // light background
}

const RANKS: Rank[] = [
  { level: 1, icon: '🌱', name: 'Seed',      nameJa: '種',    requiredPosts: 0,   color: '#34C759', bgColor: '#F0FFF4' },
  { level: 2, icon: '🌿', name: 'Sprout',    nameJa: '芽吹き', requiredPosts: 5,   color: '#30B0C7', bgColor: '#F0FAFF' },
  { level: 3, icon: '🌳', name: 'Sapling',   nameJa: '若木',  requiredPosts: 15,  color: '#007AFF', bgColor: '#F0F4FF' },
  { level: 4, icon: '⭐', name: 'Explorer',  nameJa: '探求者', requiredPosts: 30,  color: '#FF9F0A', bgColor: '#FFFBF0' },
  { level: 5, icon: '🔥', name: 'Dedicated', nameJa: '継続者', requiredPosts: 60,  color: '#FF6B35', bgColor: '#FFF4F0' },
  { level: 6, icon: '💎', name: 'Scholar',   nameJa: '学者',  requiredPosts: 100, color: '#7C4DFF', bgColor: '#F6F0FF' },
  { level: 7, icon: '👑', name: 'Master',    nameJa: '達人',  requiredPosts: 200, color: '#FFD700', bgColor: '#FFFDF0' },
];

function getCurrentRank(totalPosts: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalPosts >= rank.requiredPosts) current = rank;
  }
  return current;
}

function getNextRank(currentRank: Rank): Rank | null {
  return RANKS.find((r) => r.level === currentRank.level + 1) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_USER_NAME = 'Gengo User';

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

function RankRow({
  rank,
  totalPosts,
  isCurrent,
}: {
  rank: Rank;
  totalPosts: number;
  isCurrent: boolean;
}) {
  const achieved = totalPosts >= rank.requiredPosts;
  const isLocked = !achieved && !isCurrent;
  const nextRank = getNextRank(rank);
  const progressMax = nextRank ? nextRank.requiredPosts - rank.requiredPosts : 1;
  const progressVal = isCurrent ? Math.min(totalPosts - rank.requiredPosts, progressMax) : 0;
  const progressRatio = isCurrent ? progressVal / progressMax : achieved ? 1 : 0;

  return (
    <View style={[styles.rankRow, isCurrent && { borderColor: rank.color, borderWidth: 1.5, backgroundColor: rank.bgColor }]}>
      {/* Connector line above (not for first) */}
      {rank.level > 1 && (
        <View style={[styles.connectorLine, { backgroundColor: achieved || isCurrent ? rank.color : '#E5E5EA' }]} />
      )}

      <View style={styles.rankRowInner}>
        {/* Icon */}
        <View style={[styles.rankIconWrap, { backgroundColor: achieved ? rank.color : isCurrent ? rank.bgColor : '#F2F2F7', borderColor: achieved || isCurrent ? rank.color : '#E5E5EA' }]}>
          <Text style={[styles.rankIconText, isLocked && styles.rankIconLocked]}>
            {isLocked ? '🔒' : rank.icon}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.rankInfo}>
          <View style={styles.rankNameRow}>
            <Text style={[styles.rankName, isLocked && styles.rankNameLocked]}>
              {rank.nameJa}
            </Text>
            <Text style={[styles.rankNameEn, isLocked && styles.rankNameLocked]}>
              {rank.name}
            </Text>
            {isCurrent && (
              <View style={[styles.currentChip, { backgroundColor: rank.color }]}>
                <Text style={styles.currentChipText}>現在</Text>
              </View>
            )}
          </View>
          <Text style={[styles.rankReq, isLocked && styles.rankNameLocked]}>
            {rank.requiredPosts} 投稿〜
          </Text>
          {isCurrent && nextRank && (
            <View style={styles.miniProgressWrap}>
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: `${progressRatio * 100}%`, backgroundColor: rank.color }]} />
              </View>
              <Text style={[styles.miniProgressText, { color: rank.color }]}>
                {progressVal} / {progressMax}
              </Text>
            </View>
          )}
        </View>

        {/* Check */}
        {achieved && !isCurrent && (
          <Text style={[styles.rankCheck, { color: rank.color }]}>✓</Text>
        )}
      </View>
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
        <Text style={styles.postRowText} numberOfLines={2}>{post.text}</Text>
        <Text style={styles.postRowTopic} numberOfLines={1}>{post.topicPrompt}</Text>
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
  const currentRank = getCurrentRank(totalPosts);
  const nextRank = getNextRank(currentRank);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── ヘッダー ── */}
        <View style={[styles.header, { backgroundColor: currentRank.bgColor, borderColor: currentRank.color }]}>
          <View style={[styles.avatar, { backgroundColor: currentRank.color }]}>
            <Text style={styles.avatarText}>{MOCK_USER_NAME.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{MOCK_USER_NAME}</Text>
          <View style={styles.currentRankDisplay}>
            <Text style={styles.currentRankIcon}>{currentRank.icon}</Text>
            <View>
              <Text style={[styles.currentRankName, { color: currentRank.color }]}>
                {currentRank.nameJa}
              </Text>
              <Text style={styles.currentRankNameEn}>{currentRank.name}</Text>
            </View>
          </View>
          {nextRank && (
            <Text style={styles.nextRankHint}>
              次のランク「{nextRank.nameJa}」まで あと {nextRank.requiredPosts - totalPosts} 投稿
            </Text>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard value={streak} label="連続投稿" icon="🔥" />
          <StatCard value={totalPosts} label="総投稿数" icon="✏️" />
        </View>

        {/* ── ランクロードマップ ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ランク</Text>
          <View style={styles.rankList}>
            {[...RANKS].reverse().map((rank) => (
              <RankRow
                key={rank.level}
                rank={rank}
                totalPosts={totalPosts}
                isCurrent={rank.level === currentRank.level}
              />
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
  safe: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },

  // Header
  header: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  currentRankDisplay: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentRankIcon: { fontSize: 36 },
  currentRankName: { fontSize: 22, fontWeight: '800' },
  currentRankNameEn: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  nextRankHint: { fontSize: 12, color: '#8E8E93', textAlign: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 28, fontWeight: '700', color: '#1C1C1E' },
  statLabel: { fontSize: 11, color: '#8E8E93' },

  // Section
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },

  // Rank list
  rankList: { gap: 0 },
  rankRow: {
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    top: -8,
    left: 30,
    width: 2,
    height: 8,
  },
  rankRowInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankIconText: { fontSize: 22 },
  rankIconLocked: { opacity: 0.4 },
  rankInfo: { flex: 1, gap: 3 },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  rankNameEn: { fontSize: 12, color: '#8E8E93' },
  rankNameLocked: { color: '#C7C7CC' },
  rankReq: { fontSize: 12, color: '#8E8E93' },
  currentChip: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentChipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  rankCheck: { fontSize: 18, fontWeight: '700' },
  miniProgressWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  miniProgressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  miniProgressFill: { height: 4, borderRadius: 2 },
  miniProgressText: { fontSize: 11, fontWeight: '600', flexShrink: 0 },

  // Post history
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  postThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E5EA' },
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
  postThumbIcon: { fontSize: 20 },
  postRowBody: { flex: 1, gap: 2 },
  postRowText: { fontSize: 14, color: '#1C1C1E', lineHeight: 19 },
  postRowTopic: { fontSize: 12, color: '#8E8E93' },
  postRowDate: { fontSize: 12, color: '#C7C7CC', flexShrink: 0 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 24, gap: 4 },
  emptyText: { fontSize: 15, color: '#8E8E93' },
  emptySubText: { fontSize: 13, color: '#C7C7CC' },
});
