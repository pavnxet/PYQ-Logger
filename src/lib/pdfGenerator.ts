import jsPDF from 'jspdf';
import { Question } from '@/types';

interface PDFOptions {
  showAnswers?: boolean;
  title?: string;
  subtitle?: string;
}

export const generatePDF = (questions: Question[], options: PDFOptions = {}) => {
  const doc = new jsPDF();
  const { showAnswers = false, title = 'Exam Question Paper', subtitle = '' } = options;

  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  if (subtitle) {
    doc.setFontSize(12);
    doc.text(subtitle, pageWidth / 2, y, { align: 'center' });
    y += 10;
  }

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Questions
  doc.setFontSize(12);

  questions.forEach((q, index) => {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Question Text
    const qText = `Q${index + 1}. ${q.question_text}`;
    const splitText = doc.splitTextToSize(qText, contentWidth);
    doc.text(splitText, margin, y);
    y += splitText.length * 5 + 2;

    // Options
    const optLabels = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      const optText = `${optLabels[i]}) ${opt}`;
      doc.text(optText, margin + 5, y);
      y += 6;
    });

    y += 5; // Space between questions
  });

  // Answer Key
  if (showAnswers) {
    doc.addPage();
    y = 20;
    doc.setFontSize(16);
    doc.text('Answer Key', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    questions.forEach((q, index) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Q${index + 1}: ${q.correct_answer}`, margin, y);
      y += 7;
    });
  }

  doc.save('exam-paper.pdf');
};
