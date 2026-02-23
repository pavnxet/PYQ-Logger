'use client';

import React, { useState } from 'react';
import { ShoppingCart, X, Trash2, Download } from 'lucide-react';
import { useBucket } from '@/context/BucketContext';
import { generatePDF } from '@/lib/pdfGenerator'; // Ensure this is client-side safe

export default function ExportBucket() {
  const { bucket, removeFromBucket, clearBucket } = useBucket();
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleExport = () => {
    if (bucket.length === 0) return;
    try {
      generatePDF(bucket, {
        showAnswers,
        title: 'Exam Question Paper',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40 flex items-center gap-2"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="font-bold">{bucket.length}</span>
      </button>

      {/* Slide-over Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white w-96 h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Export Queue
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {bucket.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <p>Your bucket is empty.</p>
                  <p className="text-sm mt-2">Add questions from the dashboard to export them.</p>
                </div>
              ) : (
                bucket.map((q, index) => (
                  <div key={q.id} className="bg-gray-50 p-3 rounded-md border border-gray-200 relative group">
                    <button
                      onClick={() => removeFromBucket(q.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-medium text-gray-800 pr-6 line-clamp-2">{index + 1}. {q.question_text}</p>
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      <span className="bg-white px-2 py-0.5 rounded border">{q.difficulty}</span>
                      <span className="bg-white px-2 py-0.5 rounded border">{q.year}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={showAnswers}
                    onChange={(e) => setShowAnswers(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  Include Answer Key
                </label>
                {bucket.length > 0 && (
                  <button
                    onClick={clearBucket}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <button
                onClick={handleExport}
                disabled={bucket.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
