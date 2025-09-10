import { SafetyCheckResult } from '@/types';

// Keywords and patterns to detect inappropriate content
// Only block EXPLICITLY harmful content, not educational discussions
const INAPPROPRIATE_PATTERNS = [
  // Explicit illegal drug manufacturing
  /\b(make|create|cook|produce)\s+(meth|cocaine|heroin|lsd|mdma|ecstasy|fentanyl)\b/i,
  /\bmeth\s+(recipe|ingredients|lab)\b/i,
  
  // Explicit adult content
  /\b(porn|pornography|xxx|nude\s+photos)\b/i,
  
  // Direct violence instructions
  /\bhow\s+to\s+(kill|murder|poison|harm)\s+(someone|people|myself)\b/i,
  /\b(suicide|self-harm)\s+(method|instruction|guide)\b/i,
  
  // Personal information patterns
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
  /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i, // Addresses
];

// Age-appropriate topic boundaries - only block truly inappropriate content
// Educational discussions about history, science, literature are allowed
const GRADE_LEVEL_RESTRICTIONS = {
  elementary: {
    blocked: [], // Let the AI model handle age-appropriate responses
    redirect: "Let's focus on your schoolwork! What subject would you like help with?",
  },
  middle: {
    blocked: [], // Let the AI model handle age-appropriate responses
    redirect: "That's a topic better discussed with a parent or teacher. Let's work on your studies instead!",
  },
  high: {
    blocked: [], // Let the AI model handle age-appropriate responses
    redirect: "I'm here to help with academic topics. Let's focus on your coursework.",
  },
};

export function performSafetyCheck(
  content: string,
  gradeLevel: string
): SafetyCheckResult {
  const lowerContent = content.toLowerCase();

  // Check for inappropriate patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(content)) {
      return {
        safe: false,
        reason: 'inappropriate_content',
        suggestedRedirect: "I can only help with educational topics. What subject would you like to study?",
      };
    }
  }

  // Check grade-level specific restrictions
  const restrictions = GRADE_LEVEL_RESTRICTIONS[gradeLevel as keyof typeof GRADE_LEVEL_RESTRICTIONS];
  if (restrictions) {
    for (const blockedWord of restrictions.blocked) {
      if (lowerContent.includes(blockedWord)) {
        return {
          safe: false,
          reason: 'age_inappropriate',
          suggestedRedirect: restrictions.redirect,
        };
      }
    }
  }

  // Check for potential grooming or unsafe situations
  const unsafePatterns = [
    /meet.*in.*person/i,
    /don't.*tell.*parent/i,
    /keep.*secret/i,
    /send.*photo/i,
    /where.*do.*you.*live/i,
  ];

  for (const pattern of unsafePatterns) {
    if (pattern.test(content)) {
      return {
        safe: false,
        reason: 'safety_concern',
        suggestedRedirect: "If someone is making you uncomfortable, please talk to a trusted adult. Now, let's focus on your studies!",
      };
    }
  }

  return { safe: true };
}

export function sanitizeUserInput(input: string): string {
  // Remove any potential injection attempts
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  // Limit length to prevent abuse
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }

  return sanitized.trim();
}