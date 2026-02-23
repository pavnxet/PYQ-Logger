import Papa from 'papaparse';

export const parseCSV = (file: File): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, string>[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const validateQuestion = (question: Record<string, string>): string[] => {
  const errors: string[] = [];
  if (!question.question_text) errors.push('Missing question text');
  if (!question.optionA || !question.optionB || !question.optionC || !question.optionD) {
    errors.push('Missing options');
  }
  if (!question.correct_answer) errors.push('Missing correct answer');
  return errors;
};
