import type { ScreenDef } from './types';

/* ====== Phase Colors & Labels ====== */

export const PHASE_COLORS: Record<string, string> = {
  preliminary: '#6C3CE1',
  disability: '#FF6B9D',
  cognitive: '#4ECDC4',
  social: '#FFD43B',
  motor: '#2ED573',
  traits: '#8B5CF6',
};

export const PHASE_LABELS: Record<string, string> = {
  preliminary: 'きほん',
  disability: 'しんだん',
  cognitive: 'にんち',
  social: 'こころ',
  motor: 'からだ',
  traits: 'とくせい',
};

export const TOTAL_STEPS = 25;

/* ====== Option Arrays ====== */

export const AGE_OPTIONS = [
  { label: '2歳', value: '2' },
  { label: '3歳', value: '3' },
  { label: '4歳', value: '4' },
  { label: '5歳', value: '5' },
  { label: '6歳', value: '6' },
  { label: '7歳以上', value: '7' },
];

export const SPEECH_OPTIONS = [
  { label: '発語なし', value: 'nonverbal' },
  { label: '発語なしだが、はい/いいえは伝えられる', value: 'nonverbal_yesno' },
  { label: '単語は出るが文にならない', value: 'single_words' },
  { label: '話せるが聞き取りにくいことがある', value: 'partial_verbal' },
  { label: '会話ができる', value: 'verbal' },
];

export const DISABILITY_OPTIONS = [
  { label: '自閉スペクトラム症（ASD）', value: 'asd', category: '発達障害' },
  { label: 'ADHD（不注意優勢）', value: 'adhd_inattentive', category: '発達障害' },
  { label: 'ADHD（多動・衝動優勢）', value: 'adhd_hyperactive', category: '発達障害' },
  { label: 'ADHD（混合型）', value: 'adhd_combined', category: '発達障害' },
  { label: '知的障害（軽度）', value: 'id_mild', category: '知的障害' },
  { label: '知的障害（中度）', value: 'id_moderate', category: '知的障害' },
  { label: '知的障害（重度）', value: 'id_severe', category: '知的障害' },
  { label: '知的障害（程度不明）', value: 'id_unspecified', category: '知的障害' },
  { label: '境界知能', value: 'borderline_iq', category: '知的障害' },
  { label: '読字障害（ディスレクシア）', value: 'ld_dyslexia', category: '学習障害' },
  { label: '書字障害（ディスグラフィア）', value: 'ld_dysgraphia', category: '学習障害' },
  { label: '算数障害（ディスカリキュリア）', value: 'ld_dyscalculia', category: '学習障害' },
  { label: '発達性協調運動障害（DCD）', value: 'dcd', category: 'その他' },
  { label: '言語発達遅滞', value: 'language_delay', category: 'その他' },
  { label: 'てんかん', value: 'epilepsy', category: 'その他' },
  { label: 'その他', value: 'other', category: 'その他' },
];

export const CONCERN_OPTIONS = [
  { label: 'ことばの遅れ', value: 'concern_language' },
  { label: 'こだわりが強い', value: 'concern_rigidity' },
  { label: '落ち着きがない', value: 'concern_hyperactive' },
  { label: '集団になじめない', value: 'concern_social' },
  { label: '感覚の過敏さ', value: 'concern_sensory' },
  { label: '手先の不器用さ', value: 'concern_motor' },
  { label: '気持ちの切り替えが難しい', value: 'concern_regulation' },
  { label: '特にない', value: 'concern_none' },
];

export const BEHAVIORAL_TRAIT_OPTIONS = [
  { label: 'こだわりが強い', value: 'rigid_routine' },
  { label: 'かんしゃくが起きやすい', value: 'frequent_tantrums' },
  { label: 'じっとしているのが難しい', value: 'hyperactive' },
  { label: '気が散りやすい', value: 'inattentive' },
  { label: '不安が強い', value: 'high_anxiety' },
  { label: '特にない', value: 'none' },
];

export const SOCIAL_TRAIT_OPTIONS = [
  { label: '集団活動が苦手', value: 'group_difficulty' },
  { label: '順番を待つのが難しい', value: 'difficulty_taking_turns' },
  { label: '目が合いにくい', value: 'limited_eye_contact' },
  { label: '名前を呼んでも反応しにくい', value: 'poor_name_response' },
  { label: '特にない', value: 'none' },
];

/* ====== Screen Definitions ====== */

export const SCREENS: ScreenDef[] = [
  // Phase 0: Account
  {
    id: 0, type: 'account', phase: 'account',
    expression: 'waving', expressionSize: 120,
    title: 'Manasへようこそ', dataKey: 'account', skippable: false,
  },
  // Phase 1: Preliminary
  {
    id: 1, type: 'single_select', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'happy', expressionSize: 120,
    title: 'お子さまの年齢をおしえてください',
    subtitle: 'お子さまに合った体験をお届けします',
    dataKey: 'childAge', skippable: false,
    options: AGE_OPTIONS,
  },
  {
    id: 2, type: 'text_input', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'pointing', expressionSize: 100,
    title: 'お子さまのおなまえは？',
    subtitle: 'ニックネームでも大丈夫です',
    dataKey: 'childName', skippable: false,
  },
  {
    id: 3, type: 'single_select', phase: 'preliminary',
    phaseLabel: 'きほん', phaseColor: PHASE_COLORS.preliminary,
    expression: 'encouraging', expressionSize: 120,
    title: 'お子さまの発話の状態は？',
    dataKey: 'speechLevel', skippable: false,
    options: SPEECH_OPTIONS,
  },
  // Phase 2: Disability
  {
    id: 4, type: 'yes_no', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'surprised', expressionSize: 120,
    title: '専門家の発達評価を受けたことはありますか？',
    dataKey: 'hasEvaluation', skippable: true,
  },
  {
    id: 5, type: 'multi_chips', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'encouraging', expressionSize: 100,
    title: '診断を受けているものを選んでください',
    subtitle: '複数選択できます。あとから変更も可能です',
    dataKey: 'disabilities', skippable: true,
    options: DISABILITY_OPTIONS,
    condition: (d) => d.hasEvaluation === 'yes',
  },
  {
    id: 6, type: 'multi_chips', phase: 'disability',
    phaseLabel: 'しんだん', phaseColor: PHASE_COLORS.disability,
    expression: 'encouraging', expressionSize: 100,
    title: '気になっていることはありますか？',
    subtitle: 'あてはまるものを選んでください',
    dataKey: 'concerns', skippable: true,
    options: CONCERN_OPTIONS,
    condition: (d) => d.hasEvaluation !== 'yes',
  },
  // Phase 3: Cognitive (screens 7-14)
  {
    id: 7, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: 'お子さまは好きな遊びに3分以上集中できますか？',
    domain: 'attention', dataKey: 'q_attention', skippable: true,
  },
  {
    id: 8, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '「まって」と言われたとき、少しの間がまんできますか？',
    domain: 'inhibition', dataKey: 'q_inhibition', skippable: true,
  },
  {
    id: 9, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '2つの指示を続けて覚えて実行できますか？（例:「くつをはいて、かばんをもって」）',
    domain: 'working_memory', dataKey: 'q_working_memory', skippable: true,
  },
  {
    id: 10, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '昨日やったことを思い出して教えてくれますか？',
    domain: 'memory', dataKey: 'q_memory', skippable: true,
  },
  {
    id: 11, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '簡単な指示にすばやく反応できますか？（例:「手をたたいて」）',
    domain: 'processing_speed', dataKey: 'q_processing_speed', skippable: true,
  },
  {
    id: 12, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '遊びやルールが変わったとき、切り替えられますか？',
    domain: 'cognitive_flexibility', dataKey: 'q_cognitive_flexibility', skippable: true,
  },
  {
    id: 13, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '簡単なパターンやルールに気づきますか？（例: 赤→青→赤→？）',
    domain: 'reasoning', dataKey: 'q_reasoning', skippable: true,
  },
  {
    id: 14, type: 'yes_no', phase: 'cognitive',
    phaseLabel: 'にんち', phaseColor: PHASE_COLORS.cognitive,
    expression: 'happy', expressionSize: 100,
    title: '三角や四角などの形を見分けられますか？',
    domain: 'visuospatial', dataKey: 'q_visuospatial', skippable: true,
  },
  // Phase 4: Social (screens 15-18)
  {
    id: 15, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '他の人が泣いていたり怒っていると気づきますか？',
    domain: 'social_cognition', dataKey: 'q_social_cognition', skippable: true,
  },
  {
    id: 16, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '気持ちが高ぶったとき、少しずつ落ち着くことができますか？',
    domain: 'emotion_regulation', dataKey: 'q_emotion_regulation', skippable: true,
  },
  {
    id: 17, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '色や数字の名前をいくつか言えますか？',
    domain: 'language', dataKey: 'q_language', skippable: true,
  },
  {
    id: 18, type: 'yes_no', phase: 'social',
    phaseLabel: 'こころ', phaseColor: PHASE_COLORS.social,
    expression: 'excited', expressionSize: 100,
    title: '簡単なパズルや型はめを自分で試しますか？',
    domain: 'planning', dataKey: 'q_planning', skippable: true,
  },
  // Phase 5: Motor (screens 19-21)
  {
    id: 19, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: 'ボタンをとめたり、小さなものをつまんだりできますか？',
    domain: 'motor_skills', dataKey: 'q_motor_skills', skippable: true,
  },
  {
    id: 20, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: '絵の中から特定のものを見つけることができますか？（例: 「犬はどこ？」）',
    domain: 'perceptual', dataKey: 'q_perceptual', skippable: true,
  },
  {
    id: 21, type: 'yes_no', phase: 'motor',
    phaseLabel: 'からだ', phaseColor: PHASE_COLORS.motor,
    expression: 'clapping', expressionSize: 100,
    title: '音や光、触られることにとても敏感ですか？',
    domain: 'sensory', dataKey: 'q_sensory_sensitive', skippable: true,
  },
  // Phase 6: Traits (screens 22-23)
  {
    id: 22, type: 'multi_chips', phase: 'traits',
    phaseLabel: 'とくせい', phaseColor: PHASE_COLORS.traits,
    expression: 'encouraging', expressionSize: 100,
    title: 'あてはまるものはありますか？',
    subtitle: 'お子さまに合った配慮をするための質問です',
    dataKey: 'behavioralTraits', skippable: true,
    options: BEHAVIORAL_TRAIT_OPTIONS,
  },
  {
    id: 23, type: 'multi_chips', phase: 'traits',
    phaseLabel: 'とくせい', phaseColor: PHASE_COLORS.traits,
    expression: 'happy', expressionSize: 100,
    title: '人との関わりで気になることはありますか？',
    dataKey: 'socialTraits', skippable: true,
    options: SOCIAL_TRAIT_OPTIONS,
  },
  // Phase 7: Complete
  {
    id: 24, type: 'complete', phase: 'complete',
    expression: 'excited', expressionSize: 160,
    title: '準備ができました！',
    dataKey: 'complete', skippable: false,
  },
];

/* ====== Slide Animation Variants ====== */

export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};
