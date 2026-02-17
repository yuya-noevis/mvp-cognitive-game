import { shuffle, randomInt } from '@/lib/utils';

/** 語彙アイテム */
export interface VocabItem {
  word: string;       // 日本語の単語
  category: string;   // basic_noun, verb, adjective, abstract
}

/** 語彙データベース */
const VOCAB_DB: VocabItem[] = [
  // Basic nouns (基本名詞)
  { word: 'いぬ', category: 'basic_noun' },
  { word: 'ねこ', category: 'basic_noun' },
  { word: 'りんご', category: 'basic_noun' },
  { word: 'くるま', category: 'basic_noun' },
  { word: 'ほん', category: 'basic_noun' },
  { word: 'はな', category: 'basic_noun' },
  { word: 'おひさま', category: 'basic_noun' },
  { word: 'おうち', category: 'basic_noun' },
  { word: 'さかな', category: 'basic_noun' },
  { word: 'とり', category: 'basic_noun' },
  { word: 'つき', category: 'basic_noun' },
  { word: 'き', category: 'basic_noun' },

  // Verbs (動詞)
  { word: 'たべる', category: 'verb' },
  { word: 'はしる', category: 'verb' },
  { word: 'ねる', category: 'verb' },
  { word: 'およぐ', category: 'verb' },
  { word: 'うたう', category: 'verb' },
  { word: 'かく', category: 'verb' },
  { word: 'あそぶ', category: 'verb' },
  { word: 'よむ', category: 'verb' },

  // Adjectives (形容詞)
  { word: 'おおきい', category: 'adjective' },
  { word: 'ちいさい', category: 'adjective' },
  { word: 'あつい', category: 'adjective' },
  { word: 'つめたい', category: 'adjective' },
  { word: 'たかい', category: 'adjective' },
  { word: 'ひくい', category: 'adjective' },

  // Abstract (抽象語)
  { word: 'しあわせ', category: 'abstract' },
  { word: 'ゆうき', category: 'abstract' },
  { word: 'やさしさ', category: 'abstract' },
  { word: 'ともだち', category: 'abstract' },
];

export interface VocabTrial {
  targetWord: string;
  choices: { id: string; word: string; isCorrect: boolean }[];
}

/**
 * 語彙トライアルの生成
 */
export function generateVocabTrial(category: string, choiceCount: number): VocabTrial {
  const categoryItems = VOCAB_DB.filter(item => item.category === category);
  if (categoryItems.length < choiceCount) {
    // Fallback to basic_noun if not enough items
    const allItems = VOCAB_DB.filter(item => item.category === 'basic_noun');
    return generateTrialFromPool(allItems, choiceCount);
  }
  return generateTrialFromPool(categoryItems, choiceCount);
}

function generateTrialFromPool(pool: VocabItem[], choiceCount: number): VocabTrial {
  const shuffled = shuffle(pool);
  const target = shuffled[0];
  const distractors = shuffled.slice(1, choiceCount);

  const choices = shuffle([
    { id: `correct_${randomInt(0, 9999)}`, word: target.word, isCorrect: true },
    ...distractors.map((d, i) => ({
      id: `dist_${i}_${randomInt(0, 9999)}`,
      word: d.word,
      isCorrect: false,
    })),
  ]);

  return { targetWord: target.word, choices };
}

/**
 * Web Speech API で単語を読み上げる
 */
export function speakWord(word: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.8;  // ゆっくりめ
  utterance.pitch = 1.1; // 少し高め（子ども向け）
  window.speechSynthesis.speak(utterance);
}
