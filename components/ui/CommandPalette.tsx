/**
 * @module CommandPalette
 * @description Global command palette for quick navigation and actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileText,
  Plus,
  BarChart3,
  Settings,
  Users,
  Brain,
  Shield,
  Home,
  Search,
  Sparkles,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Command items
  const commands = [
    {
      group: 'Navigation',
      items: [
        { icon: Home, label: 'Go to Dashboard', action: () => router.push('/') },
        { icon: FileText, label: 'View Surveys', action: () => router.push('/surveys') },
        { icon: BarChart3, label: 'Analytics', action: () => router.push('/analytics') },
        { icon: Users, label: 'Respondents', action: () => router.push('/respondents') },
        { icon: Shield, label: 'Compliance', action: () => router.push('/compliance') },
        { icon: Brain, label: 'AI Insights', action: () => router.push('/ai-insights'), ai: true },
      ],
    },
    {
      group: 'Actions',
      items: [
        { icon: Plus, label: 'Create New Survey', action: () => router.push('/surveys/new'), ai: true },
        { icon: Search, label: 'Search Surveys', action: () => router.push('/surveys?search=true') },
        { icon: Settings, label: 'Settings', action: () => router.push('/settings') },
      ],
    },
    {
      group: 'AI Features',
      items: [
        { 
          icon: Sparkles, 
          label: 'Generate Survey Questions', 
          action: () => router.push('/surveys/new?ai=true'),
          ai: true 
        },
        { 
          icon: Brain, 
          label: 'Analyze Survey Results', 
          action: () => router.push('/analytics?ai=true'),
          ai: true 
        },
        { 
          icon: Shield, 
          label: 'Check Compliance', 
          action: () => router.push('/compliance?check=true'),
          ai: true 
        },
      ],
    },
  ];

  const handleSelect = (action: () => void) => {
    onOpenChange(false);
    action();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {commands.map((group, groupIndex) => (
          <div key={group.group}>
            <CommandGroup heading={group.group}>
              {group.items.map((item, itemIndex) => (
                <CommandItem
                  key={`${groupIndex}-${itemIndex}`}
                  onSelect={() => handleSelect(item.action)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.ai && (
                    <Sparkles className="h-3 w-3 text-purple-500 ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {groupIndex < commands.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}