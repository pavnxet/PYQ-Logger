'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Search } from 'lucide-react';
import { Question } from '@/types';
import { useBucket } from '@/context/BucketContext';
import { getQuestions } from '@/lib/db';

export default function QuestionTable() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    difficulty: '',
    year: '',
    exam_name: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const { addToBucket, removeFromBucket, isInBucket } = useBucket();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // Mock filtering logic is limited, so we fetch all and filter in client for search
        // But mockData supports basic filtering.
        const query: Partial<Question> = {};
        if (filters.difficulty) query.difficulty = filters.difficulty as 'Easy' | 'Medium' | 'Hard';
        if (filters.year) query.year = parseInt(filters.year);
        if (filters.exam_name) query.exam_name = filters.exam_name;

        let data = await getQuestions(query);

        if (filters.search) {
          data = data.filter(q =>
            q.question_text.toLowerCase().includes(filters.search.toLowerCase())
          );
        }

        setQuestions(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Search questions..."
              value={filters.search}
              onChange={handleFilterChange}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="py-2 px-3 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Question</th>
              <th scope="col" className="px-6 py-3">Exam / Year</th>
              <th scope="col" className="px-6 py-3">Difficulty</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">No questions found</td>
              </tr>
            ) : (
              questions.map((question) => {
                const inBucket = isInBucket(question.id);
                return (
                  <tr key={question.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-md truncate">
                      {question.question_text}
                    </td>
                    <td className="px-6 py-4">
                      {question.exam_name} {question.year}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {question.is_verified ? (
                        <span className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-gray-400">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => inBucket ? removeFromBucket(question.id) : addToBucket(question)}
                        className={`p-2 rounded-md transition-colors ${
                          inBucket
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                        title={inBucket ? "Remove from Export" : "Add to Export"}
                      >
                        {inBucket ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>Showing {questions.length} questions</span>
        {/* Pagination could go here */}
      </div>
    </div>
  );
}
