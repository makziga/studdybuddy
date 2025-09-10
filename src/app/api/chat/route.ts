import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { loadSystemPrompt, createUserMessage } from '@/utils/prompts';
import { performSafetyCheck, sanitizeUserInput } from '@/utils/safety';
import { ChatConfig, Message } from '@/types';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
    'X-Title': 'ZigAI - Educational AI Assistant',
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages, config }: { messages: Message[]; config: ChatConfig } = await req.json();

    // Safety check on the latest user message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        const safetyCheck = performSafetyCheck(lastMessage.content, config.gradeLevel.id);
        
        if (!safetyCheck.safe) {
          // Return a safe redirect message instead of processing the request
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            start(controller) {
              const data = JSON.stringify({ 
                content: safetyCheck.suggestedRedirect || "Let's focus on your studies! What subject would you like help with?" 
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            },
          });

          return new NextResponse(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        // Sanitize the input
        lastMessage.content = sanitizeUserInput(lastMessage.content);
      }
    }

    // Load the appropriate system prompt
    const systemPrompt = await loadSystemPrompt(config.gradeLevel);

    // Prepare messages for OpenRouter
    const openAIMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => {
        if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
          // Handle multimodal user message with attachments
          const content: any[] = [];
          
          // Add text content if present
          if (msg.content && msg.content.trim()) {
            content.push({
              type: 'text',
              text: createUserMessage(msg.content, config.gradeLevel.range),
            });
          }
          
          // Add file attachments
          for (const attachment of msg.attachments) {
            if (attachment.type.startsWith('image/')) {
              // Handle image attachment
              content.push({
                type: 'image_url',
                image_url: {
                  url: attachment.data,
                },
              });
            } else if (attachment.type === 'application/pdf') {
              // Handle PDF attachment
              content.push({
                type: 'file',
                file: {
                  filename: attachment.name,
                  file_data: attachment.data,
                },
              });
            }
          }
          
          return {
            role: 'user' as const,
            content,
          };
        } else if (msg.role === 'user') {
          // Handle regular user message
          return {
            role: 'user' as const,
            content: createUserMessage(msg.content, config.gradeLevel.range),
          };
        } else {
          // Handle assistant message
          return {
            role: 'assistant' as const,
            content: msg.content,
          };
        }
      }),
    ];

    // Prepare reasoning configuration if model supports it
    const reasoningParams = config.model.supportsReasoning && config.enableReasoning
      ? {
          reasoning: {
            effort: 'medium',
          },
          include_reasoning: false, // Don't include reasoning in the output
        }
      : {};

    // Create stream
    const stream = await openai.chat.completions.create({
      model: config.model.id,
      messages: openAIMessages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
      ...reasoningParams,
    });

    // Create a TransformStream to handle SSE formatting
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            
            // Only send if there's content
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({ 
            error: 'An error occurred while streaming the response' 
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}