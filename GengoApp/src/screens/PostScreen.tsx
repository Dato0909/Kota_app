import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import TopicCard from '../components/TopicCard';
import { savePost } from '../utils/storage';
import { getTodaysTopic } from '../data/topics';
import type { Post } from '../types';

export default function PostScreen() {
  const navigation = useNavigation();
  const topic = getTodaysTopic();

  const [text, setText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const canSubmit = text.trim().length > 0;

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('許可が必要です', 'カメラロールへのアクセスを許可してください。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    const post: Post = {
      id: Date.now().toString(),
      topicId: topic.id,
      topicPrompt: topic.prompt,
      text: text.trim(),
      photoUri: photoUri ?? undefined,
      createdAt: new Date().toISOString(),
    };
    await savePost(post);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerCancel}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>今日の1文</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit}>
            <Text style={[styles.headerPost, !canSubmit && styles.headerPostDisabled]}>
              投稿する
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TopicCard topic={topic} />

          {/* Template picker */}
          <View style={styles.templateCard}>
            <TouchableOpacity
              style={styles.templateToggle}
              onPress={() => setIsTemplateOpen((v) => !v)}
            >
              <Text style={styles.templateIcon}>💡</Text>
              <Text style={styles.templateToggleText}>テンプレートを使う</Text>
              <Text style={styles.chevron}>{isTemplateOpen ? '︿' : '﹀'}</Text>
            </TouchableOpacity>
            {isTemplateOpen &&
              topic.templates.map((tmpl) => (
                <TouchableOpacity
                  key={tmpl}
                  style={styles.templateItem}
                  onPress={() => {
                    setText(tmpl);
                    setIsTemplateOpen(false);
                  }}
                >
                  <Text style={styles.templateItemText}>{tmpl}</Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* Text input */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>英文を書こう</Text>
              <Text style={styles.inputHint}>1〜2文でOK</Text>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              value={text}
              onChangeText={setText}
              placeholder="例：I was blown away by the sunset today."
              placeholderTextColor="#C7C7CC"
              autoFocus
              textAlignVertical="top"
            />
          </View>

          {/* Photo section */}
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>写真を添付する（任意）</Text>
            {photoUri ? (
              <View style={styles.photoPreviewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setPhotoUri(null)}>
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonText}>📷  写真を選ぶ</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  headerCancel: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerPost: {
    fontSize: 17,
    fontWeight: '700',
    color: '#007AFF',
  },
  headerPostDisabled: {
    color: '#C7C7CC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  // Template
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.2)',
    gap: 8,
  },
  templateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateIcon: {
    fontSize: 16,
  },
  templateToggleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  chevron: {
    fontSize: 12,
    color: '#8E8E93',
  },
  templateItem: {
    backgroundColor: 'rgba(0,122,255,0.06)',
    borderRadius: 8,
    padding: 10,
  },
  templateItemText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  // Input
  inputSection: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  inputHint: {
    fontSize: 12,
    color: '#8E8E93',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1C1C1E',
    minHeight: 120,
    lineHeight: 22,
  },
  // Photo
  photoSection: {
    gap: 8,
  },
  photoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  photoButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  photoButtonText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  photoPreviewWrapper: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
