/**
 * @module VerticalNav
 * @description Power BI-style vertical navigation sidebar
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Brain,
  Shield,
  Sparkles
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  aiPowered?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: Home,
    href: '/',
    aiPowered: true,
  },
  {
    id: 'surveys',
    label: 'Surveys',
    icon: FileText,
    href: '/surveys',
    children: [
      { id: 'all-surveys', label: 'All Surveys', icon: FileText, href: '/surveys' },
      { id: 'new-survey', label: 'Create New', icon: Plus, href: '/surveys/new', aiPowered: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    badge: 'AI',
    aiPowered: true,
  },
  {
    id: 'respondents',
    label: 'Respondents',
    icon: Users,
    href: '/respondents',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: Shield,
    href: '/compliance',
    badge: 'New',
    aiPowered: true,
  },
  {
    id: 'ai-insights',
    label: 'AI Insights',
    icon: Brain,
    href: '/ai-insights',
    badge: 'Beta',
    aiPowered: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

interface VerticalNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function VerticalNav({ collapsed, onToggle }: VerticalNavProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    const ItemIcon = item.icon;

    const content = (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2.5",
          "transition-all duration-200 group relative",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          active && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
          !active && "text-gray-700 dark:text-gray-300",
          level > 0 && !collapsed && "ml-6"
        )}
      >
        <div className="flex items-center gap-3">
          <ItemIcon className={cn(
            "h-5 w-5 flex-shrink-0",
            "transition-transform group-hover:scale-110"
          )} />
          
          {!collapsed && (
            <>
              <span className="font-medium text-sm">{item.label}</span>
              
              {item.aiPowered && (
                <Sparkles className="h-3 w-3 text-purple-500" />
              )}
              
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </div>

        {!collapsed && hasChildren && (
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        )}

        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r" />
        )}
      </div>
    );

    if (collapsed) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {hasChildren ? (
                <div className="cursor-pointer">{content}</div>
              ) : (
                <Link href={item.href}>{content}</Link>
              )}
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-2">
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div key={item.id}>
        {hasChildren ? (
          <div
            className="cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            {content}
          </div>
        ) : (
          <Link href={item.href}>{content}</Link>
        )}

        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="font-semibold text-gray-900 dark:text-white">
                HealthSurvey
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto" />
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => renderNavItem(item))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center p-2 rounded-lg",
            "hover:bg-gray-100 dark:hover:bg-gray-700",
            "text-gray-600 dark:text-gray-400"
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </nav>
  );
}