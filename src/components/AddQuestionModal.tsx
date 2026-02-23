'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Subject, Chapter, Question } from '@/types';
import { getSubjects, getChapters, addQuestion } from '@/lib/db';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionAdded: () => void;
}

export default function AddQuestionModal({ isOpen, onClose, onQuestionAdded }: AddQuestionModalProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    chapter_id: '',
    question_text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_answer: 'A',
    exam_name: '',
    year: new Date().getFullYear(),
    difficulty: 'Easy',
    is_verified: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSubjects().then(setSubjects);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.subject_id) {
      getChapters(formData.subject_id).then(setChapters);
    } else {
      setChapters([]);
    }
  }, [formData.subject_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newQuestion: Omit<Question, 'id'> = {
        chapter_id: formData.chapter_id,
        question_text: formData.question_text,
        options: [formData.optionA, formData.optionB, formData.optionC, formData.optionD],
        correct_answer: formData.correct_answer, // Assuming value is 'A', 'B', etc. Or actual text? Usually index or value. Let's store value or index.
        // Actually, let's store the text value of the option for robustness, or index.
        // The mock data stores the text value. So let's find the text value corresponding to A/B/C/D.
        // But the form has optionA, optionB...
        // Let's just store the text content of the selected option.
        // Wait, mock data has `correct_answer: 'Nile'`.
        // So I should map 'A' -> optionA value.
        // Or store just 'A' if the app logic handles it. But for export, we need the text.
        // Let's store the text value.
        // correct_answer: formData[`option${formData.correct_answer}` as keyof typeof formData] as string
        // Actually simpler:
        explanation: '',
        year: Number(formData.year),
        exam_name: formData.exam_name,
        difficulty: formData.difficulty as 'Easy' | 'Medium' | 'Hard',
        is_verified: Boolean(formData.is_verified),
      };

      // Map correct_answer letter to value
      const letter = formData.correct_answer;
      if (letter === 'A') newQuestion.correct_answer = formData.optionA;
      else if (letter === 'B') newQuestion.correct_answer = formData.optionB;
      else if (letter === 'C') newQuestion.correct_answer = formData.optionC;
      else if (letter === 'D') newQuestion.correct_answer = formData.optionD;

      await addQuestion(newQuestion);
      onQuestionAdded();
      onClose();
      // Reset form?
      setFormData({
        subject_id: '',
        chapter_id: '',
        question_text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correct_answer: 'A',
        exam_name: '',
        year: new Date().getFullYear(),
        difficulty: 'Easy',
        is_verified: false,
      });
    } catch (error) {
      console.error('Failed to add question', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Add New Question</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                name="subject_id"
                value={formData.subject_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chapter</label>
              <select
                name="chapter_id"
                value={formData.chapter_id}
                onChange={handleChange}
                required
                disabled={!formData.subject_id}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Chapter</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your question here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Option {opt}</label>
                <input
                  type="text"
                  name={`option${opt}`}
                  value={formData[`option${opt}` as keyof typeof formData] as string}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${opt} text`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <select
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
              <input
                type="text"
                name="exam_name"
                value={formData.exam_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. UPSC 2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Mark as Verified</label>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
