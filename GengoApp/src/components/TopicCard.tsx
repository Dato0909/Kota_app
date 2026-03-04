import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Topic } from '../types';

interface Props {
  topic: Topic;
}

export default function TopicCard({ topic }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>今日のお題</Text>
      <Text style={styles.prompt}>{topic.prompt}</Text>
      <Text style={styles.hint}>{topic.hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  hint: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
});
