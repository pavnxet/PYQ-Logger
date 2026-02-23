interface ParsedQuestion {
  question_text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct_answer: string;
}

export const parseTextQuestions = (text: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line);

  let currentQ: Partial<ParsedQuestion> = {};

  const qPattern = /^(?:Q\d+|Q|Question\s*\d+|\d+)\.?\s*(.+)/i;
  const optPattern = /^(?:[A-D]\)|[A-D]\.|\[[A-D]\]|\([A-D]\))\s*(.+)/i;
  const ansPattern = /^(?:Ans|Answer|Correct)(?:\s*:\s*|\s+)([A-D])/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Answer first (end of a block)
    const ansMatch = line.match(ansPattern);
    if (ansMatch) {
      if (currentQ.question_text) {
        currentQ.correct_answer = ansMatch[1].toUpperCase();

        if (currentQ.optionA && currentQ.optionB && currentQ.optionC && currentQ.optionD) {
            questions.push(currentQ as ParsedQuestion);
        }
        currentQ = {}; // Reset
      }
      continue;
    }

    // Check for Option
    const optMatch = line.match(optPattern);
    if (optMatch) {
      const detailedOptPattern = /^([A-D])(?:[\)\.]|\]|\))\s*(.+)/i;
      const detailedMatch = line.match(detailedOptPattern);

      if (detailedMatch) {
        const letter = detailedMatch[1].toUpperCase();
        const content = detailedMatch[2];
        if (letter === 'A') currentQ.optionA = content;
        else if (letter === 'B') currentQ.optionB = content;
        else if (letter === 'C') currentQ.optionC = content;
        else if (letter === 'D') currentQ.optionD = content;
      }
      continue;
    }

    // Check for Question
    const qMatch = line.match(qPattern);
    if (qMatch) {
      if (currentQ.question_text) {
         currentQ = {};
      }
      currentQ.question_text = qMatch[1];
      continue;
    }
  }

  return questions;
};
