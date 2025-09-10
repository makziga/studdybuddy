import { Model, GradeLevel } from '@/types';

export const AVAILABLE_MODELS: Model[] = [
  {
    id: 'anthropic/claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    supportsReasoning: true,
    costPerMillion: {
      input: 30,
      output: 150,
    },
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    supportsReasoning: true,
    costPerMillion: {
      input: 15,
      output: 75,
    },
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    supportsReasoning: false,
    costPerMillion: {
      input: 5,
      output: 15,
    },
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    supportsReasoning: true,
    costPerMillion: {
      input: 20,
      output: 100,
    },
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    supportsReasoning: true,
    costPerMillion: {
      input: 1,
      output: 5,
    },
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    supportsReasoning: true,
    costPerMillion: {
      input: 10,
      output: 50,
    },
  },
];

export const GRADE_LEVELS: GradeLevel[] = [
  {
    id: 'elementary',
    name: 'Elementary School',
    range: '1st - 5th Grade',
    promptFile: 'elementary_1-5.md',
  },
  {
    id: 'middle',
    name: 'Middle School',
    range: '6th - 8th Grade',
    promptFile: 'middle_6-8.md',
  },
  {
    id: 'high',
    name: 'High School',
    range: '9th - 12th Grade',
    promptFile: 'high_9-12.md',
  },
];

export const DEFAULT_CHAT_CONFIG = {
  temperature: 0.7,
  maxTokens: 2000,
  enableReasoning: true,
};