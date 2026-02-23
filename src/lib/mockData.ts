import { Subject, Chapter, Question } from '@/types';

// Mock Data
let mockSubjects: Subject[] = [
  { id: '1', name: 'Geography' },
  { id: '2', name: 'History' },
  { id: '3', name: 'Science' },
];

let mockChapters: Chapter[] = [
  { id: '101', subject_id: '1', name: 'Rivers' },
  { id: '102', subject_id: '1', name: 'Mountains' },
  { id: '103', subject_id: '1', name: 'Capitals' },
  { id: '201', subject_id: '2', name: 'Ancient History' },
  { id: '202', subject_id: '2', name: 'Modern History' },
  { id: '301', subject_id: '3', name: 'Physics' },
  { id: '302', subject_id: '3', name: 'Chemistry' },
];

// eslint-disable-next-line prefer-const
export let mockQuestions: Question[] = [
  {
    id: 'q1',
    chapter_id: '101',
    question_text: 'Which is the longest river in the world?',
    options: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'],
    correct_answer: 'Nile',
    explanation: 'The Nile is widely accepted as the longest river in the world.',
    year: 2022,
    exam_name: 'UPSC',
    difficulty: 'Easy',
    is_verified: true,
  },
  {
    id: 'q2',
    chapter_id: '103',
    question_text: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correct_answer: 'Paris',
    explanation: 'Paris is the capital and most populous city of France.',
    year: 2023,
    exam_name: 'SSC CGL',
    difficulty: 'Easy',
    is_verified: true,
  },
];

// Helper functions (mocking API calls)
export const getSubjects = async (): Promise<Subject[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...mockSubjects]), 500));
};

export const addSubject = async (name: string): Promise<Subject> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSubject = { id: Math.random().toString(36).substr(2, 9), name };
      mockSubjects.push(newSubject);
      resolve(newSubject);
    }, 500);
  });
};

export const deleteSubject = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockSubjects = mockSubjects.filter((s) => s.id !== id);
      // Cascade delete chapters
      mockChapters = mockChapters.filter((c) => c.subject_id !== id);
      // Cascade delete questions (optional, but good for consistency)
      // mockQuestions = mockQuestions.filter(q => !mockChapters.find(c => c.id === q.chapter_id));
      // Need complex logic to filter questions if chapters are gone. Simplified for now.
      resolve();
    }, 500);
  });
};

export const getChapters = async (subjectId: string): Promise<Chapter[]> => {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(mockChapters.filter((c) => c.subject_id === subjectId)),
      500
    )
  );
};

export const addChapter = async (subjectId: string, name: string): Promise<Chapter> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newChapter = { id: Math.random().toString(36).substr(2, 9), subject_id: subjectId, name };
      mockChapters.push(newChapter);
      resolve(newChapter);
    }, 500);
  });
};

export const deleteChapter = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockChapters = mockChapters.filter((c) => c.id !== id);
      resolve();
    }, 500);
  });
};

export const getQuestions = async (filters: Partial<Question> = {}): Promise<Question[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = mockQuestions;
      if (filters.chapter_id) {
        filtered = filtered.filter((q) => q.chapter_id === filters.chapter_id);
      }
      if (filters.exam_name) {
        filtered = filtered.filter((q) => q.exam_name === filters.exam_name);
      }
      if (filters.year) {
        filtered = filtered.filter((q) => q.year === filters.year);
      }
      if (filters.difficulty) {
        filtered = filtered.filter((q) => q.difficulty === filters.difficulty);
      }
      if (filters.is_verified !== undefined) {
        filtered = filtered.filter((q) => q.is_verified === filters.is_verified);
      }
      resolve([...filtered]);
    }, 500);
  });
};

export const addQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newQuestion = { ...question, id: Math.random().toString(36).substr(2, 9) };
      mockQuestions.push(newQuestion);
      resolve(newQuestion);
    }, 500);
  });
};
