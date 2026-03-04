export interface Topic {
  id: string;
  prompt: string;
  hint: string;
  templates: string[];
}

export interface Post {
  id: string;
  topicId: string;
  topicPrompt: string;
  text: string;
  photoUri?: string;
  createdAt: string; // ISO date string
}
