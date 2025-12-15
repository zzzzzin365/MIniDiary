/**
 * Question Service
 * 
 * 从本地 JSON 文件加载问题，支持每日随机选择。
 * 
 * 如何更新问题库：
 * 1. 打开 Word 文档
 * 2. 将问题复制到 assets/data/questions.json
 * 3. 按照 JSON 格式添加 id, text, category
 */

import questionsData from '@/assets/data/questions.json';

export type QuestionCategory = 'self' | 'past' | 'imagination';

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
}

interface QuestionsFile {
  version: string;
  questions: Question[];
}

// Load questions from JSON file
const loadedQuestions: Question[] = (questionsData as QuestionsFile).questions;

/**
 * 获取所有问题
 */
export function getAllQuestions(): Question[] {
  return loadedQuestions;
}

/**
 * 按分类获取问题
 */
export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return loadedQuestions.filter(q => q.category === category);
}

/**
 * 根据日期获取当天的问题（每天固定，但每天不同）
 * 使用日期作为种子，确保同一天在不同设备上显示相同问题
 */
export function getDailyQuestions(date: Date = new Date(), count: number = 4): Question[] {
  // 使用日期生成一个伪随机种子
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = hashCode(dateString);
  
  // 使用种子打乱问题顺序
  const shuffled = seededShuffle([...loadedQuestions], seed);
  
  // 返回前 count 个问题
  return shuffled.slice(0, count);
}

/**
 * 获取单个随机问题
 */
export function getRandomQuestion(): Question {
  const index = Math.floor(Math.random() * loadedQuestions.length);
  return loadedQuestions[index];
}

/**
 * 根据 ID 获取问题
 */
export function getQuestionById(id: string): Question | undefined {
  return loadedQuestions.find(q => q.id === id);
}

// --- Helper Functions ---

/**
 * 简单的字符串哈希函数
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 使用种子的数组随机打乱（Fisher-Yates）
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let currentSeed = seed;
  
  // 简单的伪随机数生成器 (LCG)
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
  
  // Fisher-Yates shuffle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

