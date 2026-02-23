'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { Subject, Chapter, Question } from '@/types';
import { getSubjects, getChapters, addQuestion } from '@/lib/mockData';
import { parseCSV } from '@/utils/csvParser';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const REQUIRED_FIELDS = [
  { key: 'question_text', label: 'Question Text' },
  { key: 'optionA', label: 'Option A' },
  { key: 'optionB', label: 'Option B' },
  { key: 'optionC', label: 'Option C' },
  { key: 'optionD', label: 'Option D' },
  { key: 'correct_answer', label: 'Correct Answer (A/B/C/D)' },
];

const OPTIONAL_FIELDS = [
  { key: 'explanation', label: 'Explanation' },
  { key: 'year', label: 'Year' },
  { key: 'exam_name', label: 'Exam Name' },
  { key: 'difficulty', label: 'Difficulty' },
];

export default function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview/Import
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSubjects().then(setSubjects);
      setStep(1);
      setCsvData([]);
      setHeaders([]);
      setMapping({});
      setSelectedSubject('');
      setSelectedChapter('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSubject) {
      getChapters(selectedSubject).then(setChapters);
    } else {
      setChapters([]);
    }
  }, [selectedSubject]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await parseCSV(file);
        if (data.length > 0) {
          setCsvData(data);
          setHeaders(Object.keys(data[0]));
          // Auto-map if headers match
          const initialMapping: Record<string, string> = {};
          Object.keys(data[0]).forEach(h => {
            const lower = h.toLowerCase().replace(/_/g, '');
            if (lower.includes('question')) initialMapping['question_text'] = h;
            else if (lower.includes('optiona')) initialMapping['optionA'] = h;
            else if (lower.includes('optionb')) initialMapping['optionB'] = h;
            else if (lower.includes('optionc')) initialMapping['optionC'] = h;
            else if (lower.includes('optiond')) initialMapping['optionD'] = h;
            else if (lower.includes('correct') || lower.includes('answer')) initialMapping['correct_answer'] = h;
            else if (lower.includes('year')) initialMapping['year'] = h;
            else if (lower.includes('exam')) initialMapping['exam_name'] = h;
            else if (lower.includes('diff')) initialMapping['difficulty'] = h;
            else if (lower.includes('expl')) initialMapping['explanation'] = h;
          });
          setMapping(initialMapping);
          setStep(2);
        }
      } catch (error) {
        console.error('Error parsing CSV', error);
        alert('Failed to parse CSV file');
      }
    }
  };

  const handleMappingChange = (field: string, header: string) => {
    setMapping({ ...mapping, [field]: header });
  };

  const handleImport = async () => {
    if (!selectedChapter) {
      alert('Please select a Subject and Chapter');
      return;
    }

    setImporting(true);
    try {
      let importedCount = 0;
      for (const row of csvData) {
        // Map row data to question object
        const questionText = row[mapping['question_text']];
        const optionA = row[mapping['optionA']];
        const optionB = row[mapping['optionB']];
        const optionC = row[mapping['optionC']];
        const optionD = row[mapping['optionD']];
        const correctAnswer = row[mapping['correct_answer']];

        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
          continue; // Skip invalid rows
        }

        // Determine correct answer value
        let correctVal = optionA;
        if (correctAnswer === 'B' || correctAnswer === 'b') correctVal = optionB;
        else if (correctAnswer === 'C' || correctAnswer === 'c') correctVal = optionC;
        else if (correctAnswer === 'D' || correctAnswer === 'd') correctVal = optionD;
        else if (correctAnswer === optionB) correctVal = optionB; // Handle if full text is provided
        else if (correctAnswer === optionC) correctVal = optionC;
        else if (correctAnswer === optionD) correctVal = optionD;

        const newQuestion: Omit<Question, 'id'> = {
          chapter_id: selectedChapter,
          question_text: questionText,
          options: [optionA, optionB, optionC, optionD],
          correct_answer: correctVal,
          explanation: row[mapping['explanation']] || '',
          year: parseInt(row[mapping['year']]) || new Date().getFullYear(),
          exam_name: row[mapping['exam_name']] || '',
          difficulty: (row[mapping['difficulty']] as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          is_verified: true // Assume imported questions are verified or add toggle
        };

        await addQuestion(newQuestion);
        importedCount++;
      }

      alert(`Successfully imported ${importedCount} questions.`);
      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Import failed', error);
      alert('Import failed');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Bulk Import Questions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileUpload} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV up to 10MB</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Format Requirements
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Your CSV should contain columns for Question Text, Option A, Option B, Option C, Option D, and Correct Answer (A/B/C/D).
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Mapping & Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Chapter</label>
                  <select
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full border border-gray-300 rounded-md p-2 disabled:bg-gray-100"
                  >
                    <option value="">Select Chapter</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm text-gray-700">Map Columns</div>
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                  {REQUIRED_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-1/3">{field.label} <span className="text-red-500">*</span></span>
                      <select
                        value={mapping[field.key] || ''}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="w-2/3 border border-gray-300 rounded-md p-2 text-sm"
                      >
                        <option value="">Select Column</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                  {OPTIONAL_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 w-1/3">{field.label}</span>
                      <select
                        value={mapping[field.key] || ''}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className="w-2/3 border border-gray-300 rounded-md p-2 text-sm"
                      >
                        <option value="">Select Column</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="mr-3 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || !selectedChapter}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Start Import'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
