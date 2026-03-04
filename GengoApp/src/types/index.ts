export interface Topic {
  id: string;
  prompt: string;
  hint: string;
  templates: string[];
}

export interface UserProfile {
  name: string;
  createdAt: string; // ISO date string
}

export interface Post {
  id: string;
  topicId: string;
  topicPrompt: string;
  text: string;
  photoUri?: string;
  recordingUri?: string; // Local file URI of voice recording
  createdAt: string; // ISO date string
}

export interface Vocabulary {
  id: string;
  word: string;      // English word / phrase
  meaning: string;   // Japanese meaning
  example?: string;  // Optional example sentence
  createdAt: string; // ISO date string
}
