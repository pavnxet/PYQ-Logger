import { supabase } from './supabaseClient';
import { Subject, Chapter, Question } from '@/types';
import { mockSubjects, mockChapters, mockQuestions } from './mockData';

// Subjects
export const getSubjects = async (): Promise<Subject[]> => {
  if (!supabase) return mockSubjects;
  const { data, error } = await supabase.from('subjects').select('*').order('name');
  if (error) throw error;
  return data || [];
};

export const addSubject = async (name: string): Promise<Subject> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('subjects').insert([{ name }]).select().single();
  if (error) throw error;
  return data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { error } = await supabase.from('subjects').delete().eq('id', id);
  if (error) throw error;
};

// Chapters
export const getChapters = async (subjectId: string): Promise<Chapter[]> => {
  if (!supabase) return mockChapters.filter(c => c.subject_id === subjectId);
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('subject_id', subjectId)
    .order('name');
  if (error) throw error;
  return data || [];
};

export const addChapter = async (subjectId: string, name: string): Promise<Chapter> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('chapters').insert([{ subject_id: subjectId, name }]).select().single();
  if (error) throw error;
  return data;
};

export const deleteChapter = async (id: string): Promise<void> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { error } = await supabase.from('chapters').delete().eq('id', id);
  if (error) throw error;
};

// Questions
export const getQuestions = async (filters: Partial<Question> = {}): Promise<Question[]> => {
  if (!supabase) {
    let data = [...mockQuestions];
    if (filters.chapter_id) data = data.filter(q => q.chapter_id === filters.chapter_id);
    if (filters.exam_name) data = data.filter(q => q.exam_name === filters.exam_name);
    if (filters.year) data = data.filter(q => q.year === filters.year);
    if (filters.difficulty) data = data.filter(q => q.difficulty === filters.difficulty);
    return data;
  }
  let query = supabase.from('questions').select('*');

  if (filters.chapter_id) query = query.eq('chapter_id', filters.chapter_id);
  if (filters.exam_name) query = query.eq('exam_name', filters.exam_name);
  if (filters.year) query = query.eq('year', filters.year);
  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters.is_verified !== undefined) query = query.eq('is_verified', filters.is_verified);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const addQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  const { data, error } = await supabase.from('questions').insert([question]).select().single();
  if (error) throw error;
  return data;
};
