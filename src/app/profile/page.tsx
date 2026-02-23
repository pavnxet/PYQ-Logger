'use client';

import React, { useEffect, useState } from 'react';
import { User, Shield, BookOpen, FileText } from 'lucide-react';
import { getQuestions } from '@/lib/mockData';

export default function Profile() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    verifiedQuestions: 0,
    subjectsCount: 0, // Mocked for now, or fetch
  });

  useEffect(() => {
    const fetchStats = async () => {
      const questions = await getQuestions();
      setStats({
        totalQuestions: questions.length,
        verifiedQuestions: questions.filter(q => q.is_verified).length,
        subjectsCount: 3, // Hardcoded or fetch
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Demo User</h1>
          <p className="text-gray-500">Administrator</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Your Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Questions Logged</p>
            <p className="text-2xl font-bold">{stats.totalQuestions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Verified Questions</p>
            <p className="text-2xl font-bold">{stats.verifiedQuestions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-full">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Subjects Managed</p>
            <p className="text-2xl font-bold">{stats.subjectsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
