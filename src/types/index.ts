export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data or URL
  url?: string; // for preview purposes
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: FileAttachment[];
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