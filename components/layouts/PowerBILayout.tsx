/**
 * @module PowerBILayout
 * @description Power BI-inspired layout with vertical navigation and filter panel
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VerticalNav } from '@/components/navigation/VerticalNav';
import { TopBar } from '@/components/navigation/TopBar';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { PageTransition } from '@/components/transitions/PageTransition';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PowerBILayoutProps {
  children: ReactNode;
  showFilterPanel?: boolean;
  filters?: ReactNode;
}

export function PowerBILayout({ 
  children, 
  showFilterPanel = false,
  filters 
}: PowerBILayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(showFilterPanel);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // Ctrl/Cmd + F: Toggle filter panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && showFilterPanel) {
        e.preventDefault();
        setFilterPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showFilterPanel]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <TopBar 
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        onFilterClick={() => setFilterPanelOpen(!filterPanelOpen)}
        showFilterButton={showFilterPanel}
      />

      <div className="flex h-[calc(100vh-64px)] relative">
        {/* Vertical Navigation */}
        <AnimatePresence mode="wait">
          <motion.aside
            key="sidebar"
            initial={false}
            animate={{
              width: sidebarCollapsed ? 64 : 256,
              transition: { duration: 0.2, ease: 'easeInOut' }
            }}
            className={cn(
              "relative z-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
              "shadow-sm overflow-hidden flex-shrink-0"
            )}
          >
            <VerticalNav 
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </motion.aside>
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <PageTransition pathname={pathname}>
            <div className="h-full overflow-y-auto">
              <div className={cn(
                "p-6 max-w-[1600px] mx-auto",
                filterPanelOpen && showFilterPanel && !isMobile && "pr-80"
              )}>
                {children}
              </div>
            </div>
          </PageTransition>
        </main>

        {/* Filter Panel */}
        {showFilterPanel && (
          <AnimatePresence>
            {filterPanelOpen && (
              <motion.aside
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={cn(
                  "absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800",
                  "border-l border-gray-200 dark:border-gray-700 shadow-lg z-30",
                  "overflow-y-auto"
                )}
              >
                <FilterPanel onClose={() => setFilterPanelOpen(false)}>
                  {filters}
                </FilterPanel>
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Mobile Overlay */}
        {isMobile && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-10"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Helper */}
      <div className="sr-only" aria-live="polite">
        Press Ctrl+B to toggle sidebar, Ctrl+F to toggle filters
      </div>
    </div>
  );
}