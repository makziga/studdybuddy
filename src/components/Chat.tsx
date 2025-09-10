'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Settings, X, Check, Zap, Brain, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Model, GradeLevel, ChatConfig } from '@/types';
import { AVAILABLE_MODELS, GRADE_LEVELS, DEFAULT_CHAT_CONFIG } from '@/config/models';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(AVAILABLE_MODELS[0]);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<GradeLevel>(GRADE_LEVELS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({
    model: AVAILABLE_MODELS[0],
    gradeLevel: GRADE_LEVELS[0],
    ...DEFAULT_CHAT_CONFIG,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setConfig({
      ...config,
      model: selectedModel,
      gradeLevel: selectedGradeLevel,
    });
  }, [selectedModel, selectedGradeLevel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          config,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                    return newMessages;
                  });
                }
              } catch (err) {
                console.error('Error parsing SSE data:', err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const quickPrompts = [
    "Help me with math homework",
    "Explain photosynthesis simply", 
    "How do I write a good essay?",
    "Tell me about ancient civilizations",
    "Help me with grammar rules",
    "Explain the periodic table"
  ];

  return (
    <div className="relative h-screen bg-white overflow-hidden">
      {/* Dotted Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #000 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}></div>
      </div>
      
      {/* Static Background Circles */}
      <div className="absolute inset-0">
        <div className="absolute top-32 left-32 w-64 h-64 bg-black/[0.008] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-48 right-32 w-80 h-80 bg-black/[0.006] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-32 left-1/2 w-56 h-56 bg-black/[0.01] rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white/85 backdrop-blur-2xl border-b border-gray-100/60">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center border border-black">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-black tracking-tight">ZigAI</h1>
              <p className="text-sm text-gray-500 font-medium">AI Learning Assistant</p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-3 px-4 py-2.5 bg-white/90 border-2 border-gray-200/80 rounded-2xl"
          >
            <Settings className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-700 hidden sm:inline">{selectedModel.name}</span>
            <span className="text-xs bg-black text-white px-2.5 py-1 rounded-full">
              {selectedGradeLevel.range}
            </span>
          </button>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <>
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setShowSettings(false)}
            />
            <div className="absolute right-8 top-24 w-96 max-h-[80vh] overflow-y-auto bg-white/98 backdrop-blur-3xl rounded-3xl border-2 border-gray-200 z-50">
              <div className="sticky top-0 bg-white/98 backdrop-blur-3xl p-6 border-b border-gray-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-black tracking-tight">Settings</h3>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">Customize your experience</p>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-10 h-10 rounded-2xl border border-gray-200 flex items-center justify-center"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                    <Brain className="h-4 w-4" />
                    <span>AI Model</span>
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border ${
                          selectedModel.id === model.id 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white border-2 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className={`text-xs mt-0.5 flex items-center space-x-2 ${
                              selectedModel.id === model.id ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              <span>{model.provider}</span>
                              {model.supportsReasoning && (
                                <span className="flex items-center">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Reasoning
                                </span>
                              )}
                            </div>
                          </div>
                          {selectedModel.id === model.id && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-4">
                    <Star className="h-4 w-4" />
                    <span>Grade Level</span>
                  </label>
                  <div className="space-y-2">
                    {GRADE_LEVELS.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedGradeLevel(level)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border ${
                          selectedGradeLevel.id === level.id 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white border-2 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{level.name}</div>
                            <div className={`text-xs mt-0.5 ${
                              selectedGradeLevel.id === level.id ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {level.range}
                            </div>
                          </div>
                          {selectedGradeLevel.id === level.id && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedModel.supportsReasoning && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={config.enableReasoning}
                          onChange={(e) => setConfig({ ...config, enableReasoning: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full ${
                          config.enableReasoning ? 'bg-black' : 'bg-gray-300'
                        }`}>
                          <div className={`w-5 h-5 bg-white rounded-full border border-gray-200 transform ${
                            config.enableReasoning ? 'translate-x-6' : 'translate-x-0.5'
                          } mt-0.5`}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">Enable Reasoning Mode</div>
                        <div className="text-xs text-gray-500">Get detailed step-by-step explanations</div>
                      </div>
                    </label>
                  </div>
                )}

                {messages.length > 0 && (
                  <button
                    onClick={clearConversation}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl border border-gray-300 font-medium"
                  >
                    Clear Conversation
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mb-10 border-2 border-black">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-5xl font-bold text-black mb-6 tracking-tight">
                  Hello, I'm ZigAI
                </h1>
                <p className="text-lg text-gray-600 max-w-lg mb-12 leading-relaxed font-medium">
                  I’m here to make learning easy and fun — guiding you through the zig-zagging path of homework and studies.
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl w-full">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-3.5 bg-white/90 border-2 border-gray-200/80 rounded-2xl text-sm text-gray-700 font-medium backdrop-blur-sm"
                    >
                      {prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-32">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`relative max-w-[80%] sm:max-w-[70%]`}>
                      {message.role === 'assistant' && (
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-black rounded-xl flex items-center justify-center border border-black">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`${
                        message.role === 'user'
                          ? 'bg-black text-white rounded-3xl rounded-tr-lg px-6 py-4 border border-black'
                          : 'bg-white text-black rounded-3xl rounded-tl-lg px-6 py-4 border-2 border-gray-200'
                      }`}>
                        <div className="text-[15px] leading-relaxed">
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm prose-slate max-w-none">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-[15px]">{children}</li>,
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  return isInline ? (
                                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>
                                  ) : (
                                    <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto my-3">
                                      <code className="text-sm font-mono text-gray-800">{children}</code>
                                    </pre>
                                  );
                                },
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-black">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-black">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-black">{children}</h3>,
                                strong: ({ children }) => <strong className="font-semibold text-black">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-3 border-gray-300 pl-3 italic text-gray-600 my-3">{children}</blockquote>
                                ),
                              }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>
                        <div className={`text-[11px] mt-2 ${
                          message.role === 'user' ? 'text-gray-300' : 'text-gray-400'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="relative">
                      <div className="absolute -left-3 -top-3 w-8 h-8 bg-black rounded-xl flex items-center justify-center border border-black">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white px-6 py-4 rounded-3xl rounded-tl-lg border-2 border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>
                          <span className="text-sm text-gray-500">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/98 via-white/90 to-transparent backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="bg-white/95 rounded-3xl border-2 border-gray-200 p-3 backdrop-blur-xl">
              <div className="flex items-end space-x-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 px-5 py-4 bg-transparent resize-none focus:outline-none text-[15px] text-black placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '150px' }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    !input.trim() || isLoading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                      : 'bg-black text-white border border-black'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <div className="px-5 pb-2 pt-1 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span>{selectedModel.name}</span>
                  <span>•</span>
                  <span>{selectedGradeLevel.range}</span>
                  {config.enableReasoning && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Zap className="h-3 w-3 mr-1" />
                        Reasoning
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  Press Enter to send
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}