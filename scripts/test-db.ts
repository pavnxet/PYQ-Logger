import { getSubjects, getChapters, getQuestions, addQuestion } from '../src/lib/mockData';

async function testMockData() {
  console.log('Testing Mock Data Functions...');

  // Test getSubjects
  const subjects = await getSubjects();
  console.log('Subjects:', subjects.length);
  if (subjects.length === 0) throw new Error('No subjects found');

  // Test getChapters
  const chapters = await getChapters(subjects[0].id);
  console.log('Chapters for Subject 1:', chapters.length);
  if (chapters.length === 0) throw new Error('No chapters found for subject 1');

  // Test getQuestions
  const questions = await getQuestions();
  console.log('Total Questions:', questions.length);
  if (questions.length === 0) throw new Error('No questions found');

  // Test filtering
  const filteredQuestions = await getQuestions({ difficulty: 'Easy' });
  console.log('Easy Questions:', filteredQuestions.length);

  // Test addQuestion
  const newQuestion = {
    chapter_id: chapters[0].id,
    question_text: 'Test Question?',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 'A',
    year: 2024,
    exam_name: 'TEST',
    difficulty: 'Medium' as const,
    is_verified: false,
  };
  const added = await addQuestion(newQuestion);
  console.log('Added Question ID:', added.id);

  // Verify addition
  const allQuestions = await getQuestions();
  console.log('Total Questions after add:', allQuestions.length);
  if (allQuestions.length !== questions.length + 1) throw new Error('Question not added correctly');

  console.log('All tests passed!');
}

testMockData().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
