'use client';

import React, { useState } from 'react';
import QuestionTable from '@/components/QuestionTable';
import AddQuestionModal from '@/components/AddQuestionModal';
import ImportModal from '@/components/ImportModal';
import { Plus, Upload } from 'lucide-react';

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Question Bank</h2>
          <p className="text-gray-500 text-sm">Manage and organize your exam questions.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      <QuestionTable key={refreshTrigger} />

      <AddQuestionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onQuestionAdded={handleRefresh}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleRefresh}
      />
    </div>
  );
}
