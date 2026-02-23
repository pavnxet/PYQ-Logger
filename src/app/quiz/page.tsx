'use client';

import React, { useState, useEffect } from 'react';
import { Subject, Chapter, Question } from '@/types';
import { getSubjects, getChapters, getQuestions } from '@/lib/db';
import { Play, Clock, CheckCircle, XCircle, RefreshCw, ChevronRight, AlertTriangle, Brain } from 'lucide-react';

type QuizState = 'setup' | 'active' | 'result';

export default function QuizPage() {
  const [state, setState] = useState<QuizState>('setup');

  // Setup State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filters, setFilters] = useState({
    subjectId: '',
    chapterId: '',
    difficulty: '',
    count: 10,
    mistakeMode: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOption
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false); // Immediate feedback for current question

  // Load Subjects on Mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    loadSubjects();
  }, []);

  // Load Chapters when Subject changes
  useEffect(() => {
    if (filters.subjectId) {
      const loadChapters = async () => {
        try {
          const data = await getChapters(filters.subjectId);
          setChapters(data);
        } catch (err) {
          console.error('Failed to load chapters', err);
        }
      };
      loadChapters();
    } else {
      setChapters([]);
    }
  }, [filters.subjectId]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'active' && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, startTime]);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      let fetchedQuestions: Question[] = [];

      if (filters.mistakeMode) {
        // Load from localStorage
        const mistakeIds = JSON.parse(localStorage.getItem('mistake_bucket') || '[]');
        if (mistakeIds.length === 0) {
          setError('No mistakes found in history.');
          setLoading(false);
          return;
        }
        // We need to fetch all questions and filter by ID because getQuestions doesn't support array of IDs directly in current implementation
        // Optimization: In real app, API should support `ids` filter. Here we fetch all (mock-ish) or fetch by filters if possible.
        // Given current DB helper, we might have to fetch all.
        const allQuestions = await getQuestions();
        fetchedQuestions = allQuestions.filter(q => mistakeIds.includes(q.id));
      } else {
        const query: Partial<Question> = {};
        if (filters.chapterId) query.chapter_id = filters.chapterId;
        if (filters.difficulty) query.difficulty = filters.difficulty as 'Easy' | 'Medium' | 'Hard';

        // If subject selected but no chapter, we need to fetch all chapters for subject?
        // getQuestions only filters by chapter_id.
        // If subject is selected, we should probably fetch questions for all chapters in that subject.
        // For now, let's assume user selects chapter or we just fetch all and filter client side if needed.
        // Or simpler: If subject selected, require chapter selection or fetch all questions and filter by subject's chapters.
        // Let's stick to chapter selection for now as per DB api.

        let data = await getQuestions(query);

        // Client-side filtering for Subject if no Chapter selected (if needed)
        if (filters.subjectId && !filters.chapterId) {
          // fetch all chapters for subject
          const subjectChapters = await getChapters(filters.subjectId);
          const chapterIds = subjectChapters.map(c => c.id);
          data = data.filter(q => chapterIds.includes(q.chapter_id));
        }

        fetchedQuestions = data;
      }

      if (fetchedQuestions.length === 0) {
        setError('No questions found matching your criteria.');
        setLoading(false);
        return;
      }

      // Shuffle
      const shuffled = [...fetchedQuestions].sort(() => Math.random() - 0.5);

      // Slice
      const selected = shuffled.slice(0, filters.count);

      setQuestions(selected);
      setCurrentIndex(0);
      setUserAnswers({});
      setScore(0);
      setElapsedTime(0);
      setStartTime(Date.now());
      setShowAnswer(false);
      setState('active');
    } catch (err) {
      setError('Failed to start quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (showAnswer) return; // Prevent changing answer after submission/reveal
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: option
    }));
  };

  const handleSubmitAnswer = () => {
    if (!userAnswers[questions[currentIndex].id]) return;

    setShowAnswer(true);

    // Check correctness
    if (userAnswers[questions[currentIndex].id] === questions[currentIndex].correct_answer) {
      setScore(prev => prev + 1);
    } else {
      // Add to mistake bucket
      const mistakeIds = JSON.parse(localStorage.getItem('mistake_bucket') || '[]');
      if (!mistakeIds.includes(questions[currentIndex].id)) {
        mistakeIds.push(questions[currentIndex].id);
        localStorage.setItem('mistake_bucket', JSON.stringify(mistakeIds));
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setState('result');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (state === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            Quiz Setup
          </h1>
          <p className="text-gray-500">Customize your practice session.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md space-y-6 border border-gray-200">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-md border border-yellow-100">
            <input
              type="checkbox"
              id="mistakeMode"
              checked={filters.mistakeMode}
              onChange={(e) => setFilters({ ...filters, mistakeMode: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="mistakeMode" className="font-medium text-yellow-800 cursor-pointer select-none">
              Review &quot;Weak&quot; Questions (Mistake Bucket)
            </label>
          </div>

          {!filters.mistakeMode && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={filters.subjectId}
                    onChange={(e) => setFilters({ ...filters, subjectId: e.target.value, chapterId: '' })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Chapter</label>
                  <select
                    value={filters.chapterId}
                    onChange={(e) => setFilters({ ...filters, chapterId: e.target.value })}
                    disabled={!filters.subjectId}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">All Chapters</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Number of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={filters.count}
                    onChange={(e) => setFilters({ ...filters, count: parseInt(e.target.value) || 10 })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Quiz
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (state === 'active') {
    const currentQuestion = questions[currentIndex];

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-500">
              Question {currentIndex + 1} / {questions.length}
            </span>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Strike Rate:</span>
            <span className="font-bold text-gray-800">
              {Math.round((score / (currentIndex + (showAnswer ? 1 : 0) || 1)) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = userAnswers[currentQuestion.id] === option;
              const isCorrect = option === currentQuestion.correct_answer;

              let optionClass = "w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group ";

              if (showAnswer) {
                if (isCorrect) {
                  optionClass += "border-green-500 bg-green-50 text-green-800";
                } else if (isSelected && !isCorrect) {
                  optionClass += "border-red-500 bg-red-50 text-red-800";
                } else {
                  optionClass += "border-gray-200 opacity-50";
                }
              } else {
                if (isSelected) {
                  optionClass += "border-blue-500 bg-blue-50 text-blue-800";
                } else {
                  optionClass += "border-gray-200 hover:border-blue-300 hover:bg-gray-50";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showAnswer}
                  className={optionClass}
                >
                  <span className="font-medium">{option}</span>
                  {showAnswer && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {showAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end gap-4">
             {!showAnswer ? (
               <button
                 onClick={handleSubmitAnswer}
                 disabled={!userAnswers[currentQuestion.id]}
                 className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Submit Answer
               </button>
             ) : (
               <button
                 onClick={handleNext}
                 className="bg-gray-800 text-white px-6 py-2 rounded-md font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
               >
                 {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                 <ChevronRight className="w-4 h-4" />
               </button>
             )}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'result') {
    const accuracy = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Completed!</h2>

          <div className="grid grid-cols-3 gap-8 py-6">
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Score</p>
              <p className="text-4xl font-bold text-blue-600">{score} / {questions.length}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Accuracy</p>
              <p className={`text-4xl font-bold ${accuracy >= 70 ? 'text-green-600' : accuracy >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {accuracy}%
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm uppercase tracking-wide">Time</p>
              <p className="text-4xl font-bold text-gray-700">{formatTime(elapsedTime)}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setState('setup')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back to Setup
            </button>
            <button
              onClick={() => {
                setFilters({ ...filters, mistakeMode: true });
                setState('setup');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retake Mistakes
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Review</h3>
          {questions.map((q, i) => {
            const userAnswer = userAnswers[q.id];
            const isCorrect = userAnswer === q.correct_answer;

            return (
              <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex gap-3">
                  <span className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>Q{i + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-gray-900">{q.question_text}</p>
                    <div className="text-sm">
                      <p className="text-gray-600">Your Answer: <span className={isCorrect ? 'font-bold text-green-700' : 'font-bold text-red-700'}>{userAnswer}</span></p>
                      {!isCorrect && (
                        <p className="text-green-700 mt-1">Correct Answer: <span className="font-bold">{q.correct_answer}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
