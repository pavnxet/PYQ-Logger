'use client';

import React, { useEffect, useState } from 'react';
import { Search, UserCircle, Bell } from 'lucide-react';
import { getQuestions } from '@/lib/db';
import Link from 'next/link';

export default function Header() {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const questions = await getQuestions();
        setTotalQuestions(questions.length);
        setVerifiedCount(questions.filter((q) => q.is_verified).length);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 fixed top-0 left-64 right-0 z-10 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <span className="font-semibold">{totalQuestions}</span>
          <span>Questions</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-green-600">{verifiedCount}</span>
          <span>Verified</span>
        </div>

        <div className="flex items-center space-x-4 border-l pl-4 border-gray-200">
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Search className="w-5 h-5 text-gray-500" />
          </button>
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <Link href="/profile" className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <UserCircle className="w-6 h-6 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}
