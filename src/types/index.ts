export interface Subject {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
}

export interface Question {
  id: string;
  chapter_id: string;
  question_text: string;
  options: string[]; // Using string[] for simplicity, could be JSON
  correct_answer: string; // Could be index or value
  explanation?: string;
  year?: number;
  exam_name?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  is_verified?: boolean;
}
