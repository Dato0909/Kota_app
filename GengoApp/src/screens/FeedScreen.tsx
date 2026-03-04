import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function FeedScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>フィード</Text>
        <Text style={styles.sub}>他のユーザーの投稿がここに表示されます</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  sub: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
