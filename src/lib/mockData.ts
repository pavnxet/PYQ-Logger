import { Subject, Chapter, Question } from '@/types';

export const mockSubjects: Subject[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Science' }
];

export const mockChapters: Chapter[] = [
  { id: '101', subject_id: '1', name: 'Algebra' },
  { id: '102', subject_id: '1', name: 'Geometry' },
  { id: '201', subject_id: '2', name: 'Physics' },
  { id: '202', subject_id: '2', name: 'Chemistry' }
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    chapter_id: '101',
    question_text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct_answer: '4',
    difficulty: 'Easy',
    year: 2023,
    exam_name: 'SSC',
    is_verified: true
  },
  {
    id: 'q2',
    chapter_id: '201',
    question_text: 'What is the speed of light?',
    options: ['3x10^8 m/s', '3x10^6 m/s', '300 m/s', 'Infinite'],
    correct_answer: '3x10^8 m/s',
    difficulty: 'Medium',
    year: 2022,
    exam_name: 'UPSC',
    is_verified: true
  },
  {
    id: 'q3',
    chapter_id: '101',
    question_text: 'Value of pi?',
    options: ['3.14', '3.12', '3.16', '3.00'],
    correct_answer: '3.14',
    difficulty: 'Easy',
    year: 2024,
    exam_name: 'SSC',
    is_verified: true
  }
];
