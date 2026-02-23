'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Question } from '@/types';

interface BucketContextType {
  bucket: Question[];
  addToBucket: (question: Question) => void;
  removeFromBucket: (questionId: string) => void;
  clearBucket: () => void;
  isInBucket: (questionId: string) => boolean;
}

const BucketContext = createContext<BucketContextType | undefined>(undefined);

export function BucketProvider({ children }: { children: React.ReactNode }) {
  const [bucket, setBucket] = useState<Question[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('exam-prep-bucket');
    if (saved) {
      try {
        // eslint-disable-next-line
        setBucket(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bucket from local storage', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('exam-prep-bucket', JSON.stringify(bucket));
  }, [bucket]);

  const addToBucket = (question: Question) => {
    if (!isInBucket(question.id)) {
      setBucket((prev) => [...prev, question]);
    }
  };

  const removeFromBucket = (questionId: string) => {
    setBucket((prev) => prev.filter((q) => q.id !== questionId));
  };

  const clearBucket = () => {
    setBucket([]);
  };

  const isInBucket = (questionId: string) => {
    return bucket.some((q) => q.id === questionId);
  };

  return (
    <BucketContext.Provider value={{ bucket, addToBucket, removeFromBucket, clearBucket, isInBucket }}>
      {children}
    </BucketContext.Provider>
  );
}

export function useBucket() {
  const context = useContext(BucketContext);
  if (context === undefined) {
    throw new Error('useBucket must be used within a BucketProvider');
  }
  return context;
}
