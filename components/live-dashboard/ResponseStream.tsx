'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Download, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useResponseStream } from '@/hooks/useResponseStream';
import { formatDistanceToNow } from 'date-fns';
import { sanitizeText } from '@/lib/utils/sanitize';
import { exportToCSV } from '@/utils/export-utils';

interface Response {
  id: string;
  surveyId: string;
  surveyTitle: string;
  respondentId: string;
  respondentName: string;
  respondentEmail?: string;
  status: 'completed' | 'in_progress' | 'abandoned';
  completionRate: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  answers: Record<string, any>;
  metadata?: {
    device?: string;
    location?: string;
    browser?: string;
  };
}

interface ResponseStreamProps {
  surveyId?: string;
  limit?: number;
  onResponseClick?: (response: Response) => void;
}

const ResponseRow = memo(({ 
  response, 
  style, 
  onClick 
}: { 
  response: Response; 
  style: React.CSSProperties;
  onClick?: (response: Response) => void;
}) => {
  const getStatusIcon = () => {
    switch (response.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'abandoned':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      abandoned: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={variants[response.status]}>
        {response.status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="px-4"
    >
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onClick?.(response)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${response.respondentName}`} />
                <AvatarFallback>
                  {response.respondentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{response.respondentName}</p>
                  {getStatusIcon()}
                  {getStatusBadge()}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {response.surveyTitle} • {formatDistanceToNow(new Date(response.startedAt), { addSuffix: true })}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{Object.keys(response.answers).length} answers</span>
                  </div>
                  
                  {response.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{Math.round(response.duration / 60)}m</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${response.completionRate}%` }}
                      />
                    </div>
                    <span>{response.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {response.metadata?.device && (
              <Badge variant="outline" className="text-xs">
                {response.metadata.device}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ResponseRow.displayName = 'ResponseRow';

export default function ResponseStream({ 
  surveyId, 
  limit = 100,
  onResponseClick 
}: ResponseStreamProps) {
  const { socket, isConnected } = useSocket();
  const { 
    responses, 
    loading, 
    hasMore, 
    loadMore,
    filterResponses,
    exportResponses 
  } = useResponseStream(surveyId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResponses, setFilteredResponses] = useState<Response[]>([]);
  const listRef = useRef<List>(null);

  // Filter responses based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = responses.filter(r => 
        r.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.respondentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.surveyTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredResponses(filtered);
    } else {
      setFilteredResponses(responses);
    }
  }, [responses, searchTerm]);

  // Handle new response animation
  useEffect(() => {
    if (socket && isConnected) {
      const handleNewResponse = (data: Response) => {
        // Scroll to top to show new response
        listRef.current?.scrollToItem(0, 'start');
      };

      socket.on('analytics:response:received', handleNewResponse);
      
      return () => {
        socket.off('analytics:response:received', handleNewResponse);
      };
    }
  }, [socket, isConnected]);

  const isItemLoaded = (index: number) => {
    return !hasMore || index < filteredResponses.length;
  };

  const loadMoreItems = useCallback(() => {
    if (loading || !hasMore) return Promise.resolve();
    return loadMore();
  }, [loading, hasMore, loadMore]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }

    const response = filteredResponses[index];
    return (
      <ResponseRow 
        response={response} 
        style={style} 
        onClick={onResponseClick}
      />
    );
  };

  const handleExport = () => {
    exportResponses('csv');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Live Response Feed</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="animate-pulse">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Live
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  Offline
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredResponses.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or survey..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(sanitizeText(e.target.value))}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        {loading && filteredResponses.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-2 text-gray-400" />
            <p>No responses yet</p>
            <p className="text-sm text-gray-400">Responses will appear here in real-time</p>
          </div>
        ) : (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? filteredResponses.length + 1 : filteredResponses.length}
            loadMoreItems={loadMoreItems}
          >
            {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  ref(list);
                  // @ts-ignore
                  listRef.current = list;
                }}
                height={600}
                itemCount={hasMore ? filteredResponses.length + 1 : filteredResponses.length}
                itemSize={120}
                width="100%"
                onItemsRendered={onItemsRendered}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        )}
      </CardContent>
    </Card>
  );
}