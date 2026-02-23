-- Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subjects Table
CREATE TABLE subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters Table
CREATE TABLE chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, name)
);

-- Questions Table
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Storing options as JSON array ["A", "B", "C", "D"]
  correct_answer TEXT NOT NULL, -- Index or Value
  explanation TEXT,
  year INTEGER,
  exam_name TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster filtering
CREATE INDEX idx_questions_chapter_id ON questions(chapter_id);
CREATE INDEX idx_questions_exam_name ON questions(exam_name);
CREATE INDEX idx_questions_year ON questions(year);
CREATE INDEX idx_chapters_subject_id ON chapters(subject_id);

-- RLS (Row Level Security) Policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for authenticated users" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON questions FOR SELECT TO authenticated USING (true);

-- Allow write access only to specific users or all authenticated (adjust as needed)
CREATE POLICY "Allow insert for authenticated users" ON questions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update for authenticated users" ON questions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow delete for authenticated users" ON questions FOR DELETE TO authenticated USING (true);

-- Allow subject/chapter management
CREATE POLICY "Allow insert subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow delete subjects" ON subjects FOR DELETE TO authenticated USING (true);
CREATE POLICY "Allow insert chapters" ON chapters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow delete chapters" ON chapters FOR DELETE TO authenticated USING (true);
