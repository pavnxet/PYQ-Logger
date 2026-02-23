'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, BookOpen, Search } from 'lucide-react';
import { Subject, Chapter } from '@/types';
import { getSubjects, getChapters } from '@/lib/mockData';

export default function Sidebar() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<{ [key: string]: Chapter[] }>({});
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedSubjects = await getSubjects();
        setSubjects(fetchedSubjects);

        // Prefetch chapters for simplicity
        const chaptersMap: { [key: string]: Chapter[] } = {};
        for (const sub of fetchedSubjects) {
          const fetchedChapters = await getChapters(sub.id);
          chaptersMap[sub.id] = fetchedChapters;
        }
        setChapters(chaptersMap);
      } catch (error) {
        console.error('Failed to fetch sidebar data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Loading navigation...</div>;
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-400" />
          Exam Prep
        </h1>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-800 text-sm rounded-md py-2 pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <nav className="space-y-1">
          {subjects.map((subject) => (
            <div key={subject.id}>
              <button
                onClick={() => toggleSubject(subject.id)}
                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-800 transition-colors text-left"
              >
                <span className="font-medium">{subject.name}</span>
                {expandedSubjects.has(subject.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedSubjects.has(subject.id) && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-700 pl-2">
                  {chapters[subject.id]?.map((chapter) => (
                    <Link
                      key={chapter.id}
                      href={`/?subject=${subject.id}&chapter=${chapter.id}`}
                      className="block p-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    >
                      {chapter.name}
                    </Link>
                  ))}
                  {(!chapters[subject.id] || chapters[subject.id].length === 0) && (
                    <div className="p-2 text-xs text-gray-500">No chapters</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800 text-xs text-gray-500">
        v1.0.0
      </div>
    </aside>
  );
}
