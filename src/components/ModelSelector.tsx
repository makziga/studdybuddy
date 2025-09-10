'use client';

import { useState } from 'react';
import { ChevronDown, Zap, DollarSign } from 'lucide-react';
import { Model } from '@/types';
import { AVAILABLE_MODELS } from '@/config/models';

interface ModelSelectorProps {
  selectedModel: Model;
  onSelect: (model: Model) => void;
}

export default function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-md"
      >
        <div className="text-left">
          <div className="text-sm font-medium text-black">{selectedModel.name}</div>
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <span>{selectedModel.provider}</span>
            {selectedModel.supportsReasoning && (
              <Zap className="h-3 w-3 text-black" />
            )}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md border-2 border-gray-300 z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-600 px-2 py-1 uppercase tracking-wider">
                Available Models
              </div>
              {AVAILABLE_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelect(model);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-md border ${
                    selectedModel.id === model.id ? 'bg-black text-white border-black' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`font-medium ${selectedModel.id === model.id ? 'text-white' : 'text-black'}`}>{model.name}</div>
                      <div className={`text-xs mt-1 ${selectedModel.id === model.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span>{model.provider}</span>
                        {model.supportsReasoning && (
                          <span className="ml-2 inline-flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            Reasoning
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`text-xs flex items-center ${selectedModel.id === model.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      <DollarSign className="h-3 w-3" />
                      <span>
                        ${model.costPerMillion.input}/M in
                        <br />
                        ${model.costPerMillion.output}/M out
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-300 p-3">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Models with reasoning provide step-by-step explanations.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}