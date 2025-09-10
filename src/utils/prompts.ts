import { promises as fs } from 'fs';
import path from 'path';
import { GradeLevel } from '@/types';

export async function loadSystemPrompt(gradeLevel: GradeLevel): Promise<string> {
  const promptPath = path.join(process.cwd(), 'prompts', gradeLevel.promptFile);
  const promptContent = await fs.readFile(promptPath, 'utf-8');
  
  // Combine prompts with safety first
  return `${promptContent}`;
}

export function createUserMessage(content: string, gradeLevel: string): string {
  // Add context about the student's grade level
  return `[Student Grade Level: ${gradeLevel}]\n\n${content}`;
}