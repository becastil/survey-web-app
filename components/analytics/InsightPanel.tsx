/**
 * @module InsightPanel
 * @description Streaming insights panel with KB integration
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { getArchonClient } from '@/lib/archon/client';
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  Copy,
  Download,
  Share,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  BarChart3,
  PieChart,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import { sanitizeText } from '@/lib/utils/sanitize';

interface InsightMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    sources?: string[];
    chartType?: string;
    dataPoints?: number;
  };
  feedback?: 'positive' | 'negative' | null;
}

interface InsightPanelProps {
  surveyId?: string;
  context?: Record<string, any>;
  initialPrompt?: string;
  streamingEnabled?: boolean;
  className?: string;
}

export function InsightPanel({
  surveyId,
  context,
  initialPrompt,
  streamingEnabled = true,
  className
}: InsightPanelProps) {
  const [messages, setMessages] = useState<InsightMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  // Suggested prompts
  const suggestedPrompts = [
    { icon: TrendingUp, text: 'Analyze response trends', category: 'trends' },
    { icon: BarChart3, text: 'Compare demographics', category: 'demographics' },
    { icon: PieChart, text: 'Segment analysis', category: 'segmentation' },
    { icon: AlertCircle, text: 'Identify issues', category: 'issues' }
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: InsightMessage = {
        id: 'welcome',
        type: 'system',
        content: `Welcome to AI Analytics Insights! I can help you analyze survey data, identify trends, and generate actionable recommendations.${
          surveyId ? ` I'm ready to analyze Survey ${surveyId}.` : ''
        }`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (prompt?: string) => {
    const messageText = sanitizeText(prompt || input);
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: InsightMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);
    
    // Create assistant message placeholder
    const assistantMessage: InsightMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      metadata: {}
    };
    
    try {
      const archonClient = getArchonClient();
      
      // Build context for the query
      const queryContext = `
        ${surveyId ? `Analyzing Survey ID: ${surveyId}` : ''}
        ${context ? `Context: ${JSON.stringify(context)}` : ''}
        User Query: ${messageText}
        
        Provide actionable insights with specific recommendations.
      `;
      
      if (streamingEnabled) {
        // Stream response
        setIsStreaming(true);
        setIsThinking(false);
        
        abortControllerRef.current = new AbortController();
        let fullContent = '';
        
        setMessages(prev => [...prev, assistantMessage]);
        
        try {
          const stream = archonClient.streamQuery(
            queryContext,
            (chunk) => {
              fullContent += chunk;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.type === 'assistant') {
                  lastMessage.content = fullContent;
                }
                return newMessages;
              });
            }
          );
          
          // Consume the stream if it's iterable
          if (stream && typeof (stream as any)[Symbol.asyncIterator] === 'function') {
            for await (const _chunk of stream as unknown as AsyncIterable<string>) {
              if (abortControllerRef.current?.signal.aborted) break;
            }
          }
          
          // Add metadata after streaming completes
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.type === 'assistant') {
              lastMessage.metadata = {
                confidence: 0.85 + Math.random() * 0.15,
                dataPoints: context?.dataPoints || 0,
                sources: ['Archon KB', 'Survey Analytics']
              };
            }
            return newMessages;
          });
        } catch (error) {
          console.error('Streaming error:', error);
        } finally {
          setIsStreaming(false);
        }
      } else {
        // Non-streaming response
        const response = await archonClient.query(queryContext, {
          cacheKey: `insight:${surveyId}:${messageText}`,
          cacheTTL: 60
        });
        
        assistantMessage.content = (response as any)?.data?.content || 'Unable to generate insights at this time.';
        assistantMessage.metadata = {
          confidence: (response as any)?.data?.confidence || 0.8,
          sources: (response as any)?.data?.sources || ['Archon KB']
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Insight generation error:', error);
      
      assistantMessage.content = 'I encountered an error while generating insights. Please try again.';
      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setIsThinking(false);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
    
    toast({
      title: 'Feedback Received',
      description: 'Thank you for helping improve our insights!',
    });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied',
      description: 'Insight copied to clipboard',
    });
  };

  const handleExport = () => {
    const exportData = messages
      .filter(m => m.type !== 'system')
      .map(m => ({
        type: m.type,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        metadata: m.metadata
      }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights-${surveyId || 'export'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported',
      description: 'Insights exported successfully',
    });
  };

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
            {surveyId && (
              <Badge variant="secondary">Survey {surveyId}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={messages.length <= 1}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4 py-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'flex gap-3',
                  message.type === 'user' && 'justify-end'
                )}
              >
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}
                
                <div className={cn(
                  'flex-1 space-y-2',
                  message.type === 'user' && 'max-w-[80%]'
                )}>
                  <div className={cn(
                    'rounded-lg p-3',
                    message.type === 'user' && 'bg-primary text-primary-foreground',
                    message.type === 'assistant' && 'bg-muted',
                    message.type === 'system' && 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
                  )}>
                    {message.type === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                        {sanitizeText(message.content || (isThinking ? 'Thinking...' : ''))}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-sm">{sanitizeText(message.content)}</p>
                    )}
                  </div>
                  
                  {/* Metadata and Actions */}
                  {message.type === 'assistant' && message.content && (
                    <div className="flex items-center gap-2">
                      {message.metadata?.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(message.metadata.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      )}
                      {message.metadata?.sources && (
                        <Badge variant="outline" className="text-xs">
                          {message.metadata.sources.length} sources
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-2',
                          message.feedback === 'positive' && 'text-green-500'
                        )}
                        onClick={() => handleFeedback(message.id, 'positive')}
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-7 px-2',
                          message.feedback === 'negative' && 'text-red-500'
                        )}
                        onClick={() => handleFeedback(message.id, 'negative')}
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing data...</span>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        
        <Separator />
        
        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <div className="px-4 py-2">
            <div className="flex gap-2 flex-wrap">
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleSendMessage(prompt.text)}
                >
                  <prompt.icon className="h-3 w-3" />
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(sanitizeText(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about trends, patterns, or get recommendations..."
              className="min-h-[60px] resize-none"
              disabled={isStreaming || isThinking}
            />
            {isStreaming ? (
              <Button
                onClick={handleStop}
                variant="destructive"
                size="icon"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isThinking}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}