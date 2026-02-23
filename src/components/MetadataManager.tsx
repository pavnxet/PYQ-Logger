'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, Folder, Book } from 'lucide-react';
import { Subject, Chapter } from '@/types';
import { getSubjects, getChapters, addSubject, deleteSubject, addChapter, deleteChapter } from '@/lib/mockData';

export default function MetadataManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [chaptersMap, setChaptersMap] = useState<{ [key: string]: Chapter[] }>({});
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    const data = await getSubjects();
    setSubjects(data);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchSubjects();
    };
    init();
  }, []);

  const fetchChapters = async (subjectId: string) => {
    const data = await getChapters(subjectId);
    setChaptersMap(prev => ({ ...prev, [subjectId]: data }));
  };

  const toggleSubject = (id: string) => {
    if (expandedSubject === id) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(id);
      if (!chaptersMap[id]) {
        fetchChapters(id);
      }
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    await addSubject(newSubjectName);
    setNewSubjectName('');
    fetchSubjects();
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm('Are you sure? This will delete all chapters and questions within this subject.')) {
      await deleteSubject(id);
      fetchSubjects();
    }
  };

  const handleAddChapter = async (e: React.FormEvent, subjectId: string) => {
    e.preventDefault();
    if (!newChapterName.trim()) return;
    await addChapter(subjectId, newChapterName);
    setNewChapterName('');
    fetchChapters(subjectId);
  };

  const handleDeleteChapter = async (subjectId: string, chapterId: string) => {
    if (confirm('Are you sure? This will delete all questions within this chapter.')) {
      await deleteChapter(chapterId);
      fetchChapters(subjectId);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Manage Subjects & Chapters</h2>

      {/* Add Subject Form */}
      <form onSubmit={handleAddSubject} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="New Subject Name"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </form>

      {/* Subjects List */}
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-gray-50 p-3 flex items-center justify-between">
              <button
                onClick={() => toggleSubject(subject.id)}
                className="flex items-center gap-2 font-medium text-gray-700 hover:text-blue-600"
              >
                {expandedSubject === subject.id ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folder className="w-4 h-4 text-blue-500" />
                {subject.name}
              </button>
              <button
                onClick={() => handleDeleteSubject(subject.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Delete Subject"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {expandedSubject === subject.id && (
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Add Chapter Form */}
                <form onSubmit={(e) => handleAddChapter(e, subject.id)} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    placeholder="New Chapter Name"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Add Chapter
                  </button>
                </form>

                {/* Chapters List */}
                <div className="space-y-2 ml-4 border-l-2 border-gray-100 pl-4">
                  {chaptersMap[subject.id]?.map((chapter) => (
                    <div key={chapter.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Book className="w-3 h-3 text-gray-400" />
                        {chapter.name}
                      </div>
                      <button
                        onClick={() => handleDeleteChapter(subject.id, chapter.id)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!chaptersMap[subject.id] || chaptersMap[subject.id].length === 0) && (
                    <p className="text-xs text-gray-400 italic">No chapters yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {subjects.length === 0 && (
          <p className="text-center text-gray-500 py-4">No subjects found. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
