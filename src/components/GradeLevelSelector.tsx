'use client';

import { useState } from 'react';
import { GraduationCap, ChevronDown } from 'lucide-react';
import { GradeLevel } from '@/types';
import { GRADE_LEVELS } from '@/config/models';

interface GradeLevelSelectorProps {
  selectedGradeLevel: GradeLevel;
  onSelect: (level: GradeLevel) => void;
}

export default function GradeLevelSelector({ selectedGradeLevel, onSelect }: GradeLevelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (id: string) => {
    switch (id) {
      case 'elementary':
        return '1-5';
      case 'middle':
        return '6-8';
      case 'high':
        return '9-12';
      default:
        return 'K-12';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-md"
      >
        <span className="text-xs font-mono bg-black text-white px-1.5 py-0.5 rounded">{getIcon(selectedGradeLevel.id)}</span>
        <div className="text-left">
          <div className="text-sm font-medium text-black">{selectedGradeLevel.name}</div>
          <div className="text-xs text-gray-500">{selectedGradeLevel.range}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md border-2 border-gray-300 z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-600 px-2 py-1 uppercase tracking-wider">
                Select Grade Level
              </div>
              {GRADE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => {
                    onSelect(level);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-3 rounded-md border flex items-center space-x-3 ${
                    selectedGradeLevel.id === level.id ? 'bg-black text-white border-black' : 'border-transparent'
                  }`}
                >
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    selectedGradeLevel.id === level.id ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>{getIcon(level.id)}</span>
                  <div>
                    <div className={`font-medium ${selectedGradeLevel.id === level.id ? 'text-white' : 'text-black'}`}>{level.name}</div>
                    <div className={`text-xs ${selectedGradeLevel.id === level.id ? 'text-gray-300' : 'text-gray-500'}`}>{level.range}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-300 p-3">
              <p className="text-xs text-gray-600">
                <GraduationCap className="h-3 w-3 inline mr-1" />
                Content tailored to selected grade level
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}