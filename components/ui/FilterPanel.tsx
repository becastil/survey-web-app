/**
 * @module FilterPanel
 * @description Power BI-style filter panel for contextual filtering
 */

'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterPanelProps {
  children?: ReactNode;
  onClose: () => void;
  onReset?: () => void;
  title?: string;
}

export function FilterPanel({ 
  children, 
  onClose, 
  onReset,
  title = 'Filters' 
}: FilterPanelProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {onReset && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              className="h-8 w-8"
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close filter panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {children || (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No filters available</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onReset}
          >
            Clear All
          </Button>
          <Button 
            className="flex-1"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
}

export function FilterSection({ title, children, collapsible = true }: FilterSectionProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="space-y-3">
      <div 
        className={cn(
          "flex items-center justify-between",
          collapsible && "cursor-pointer"
        )}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h4>
        {collapsible && (
          <ChevronDown className={cn(
            "h-4 w-4 text-gray-500 transition-transform",
            collapsed && "-rotate-90"
          )} />
        )}
      </div>
      
      {!collapsed && (
        <div className="space-y-2">
          {children}
        </div>
      )}
      
      <Separator className="mt-4" />
    </div>
  );
}