export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  supportsReasoning: boolean;
  costPerMillion: {
    input: number;
    output: number;
  };
}

export interface GradeLevel {
  id: string;
  name: string;
  range: string;
  promptFile: string;
}

export interface ChatConfig {
  model: Model;
  gradeLevel: GradeLevel;
  temperature: number;
  maxTokens: number;
  enableReasoning: boolean;
}

export interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  suggestedRedirect?: string;
}