import { Topic } from '../types';

export const TOPICS: Topic[] = [
  {
    id: '1',
    prompt: '今日ほっとした瞬間は？',
    hint: '感情形容詞やイディオムを使ってみよう（例: "What a relief..."）',
    templates: [
      'I felt relieved when ___ because ___.',
      'What a relief! I finally ___.',
      'I was so glad that ___ today.',
    ],
  },
  {
    id: '2',
    prompt: '最近やめたこと・始めたこと',
    hint: '継続表現を使ってみよう（例: "I\'ve been trying to..."）',
    templates: [
      "I've been trying to ___ lately.",
      'I gave up ___ because ___.',
      'I recently started ___ and it feels ___.',
    ],
  },
  {
    id: '3',
    prompt: '今日誰かにしてあげたこと',
    hint: '動詞・副詞を使ってみよう（例: "I quietly helped..."）',
    templates: [
      'I helped ___ by ___.',
      'I quietly ___ for ___ today.',
      'She/He seemed really ___ when I ___.',
    ],
  },
  {
    id: '4',
    prompt: '今いる場所を一言で表すと？',
    hint: '形容詞・比喩・イディオムを使ってみよう',
    templates: [
      'This place is ___ because ___.',
      'It feels like ___ here.',
      'I would describe this place as ___.',
    ],
  },
  {
    id: '5',
    prompt: '今週一番驚いたこと',
    hint: '感嘆表現・過去形を使ってみよう（例: "I was blown away by..."）',
    templates: [
      'I was blown away by ___ this week.',
      'I was surprised to find out that ___.',
      'I never expected ___ to happen.',
    ],
  },
  {
    id: '6',
    prompt: '今日のランチ・食事について',
    hint: '感想・形容詞を使ってみよう',
    templates: [
      'I had ___ for lunch today. It was ___.',
      'The best part of my meal was ___.',
      'I tried ___ for the first time and it tasted ___.',
    ],
  },
  {
    id: '7',
    prompt: '今日学んだこと・気づいたこと',
    hint: '発見の表現を使ってみよう（例: "I realized..."）',
    templates: [
      'Today I realized that ___.',
      'I learned ___ today, which made me think ___.',
      'It was interesting to discover that ___.',
    ],
  },
];

export function getTodaysTopic(): Topic {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TOPICS[dayOfYear % TOPICS.length];
}
