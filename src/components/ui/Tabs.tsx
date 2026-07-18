import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

interface TabsProps {
  defaultTab?: string;
  value?: string;
  onChange?: (tab: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultTab = '', value, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultTab);
  const activeTab = value ?? internal;

  const setActiveTab = (tab: string) => {
    if (!value) setInternal(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'line' | 'pill';
}

export function TabList({ children, className, variant = 'line' }: TabListProps) {
  if (variant === 'pill') {
    return (
      <div
        role="tablist"
        className={cn('flex items-center gap-1 bg-slate-100 rounded-lg p-1', className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={cn('flex items-center gap-0 border-b border-slate-200 overflow-x-auto', className)}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
  className?: string;
  variant?: 'line' | 'pill';
}

export function TabTrigger({ value, children, disabled, badge, className, variant = 'line' }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  if (variant === 'pill') {
    return (
      <button
        role="tab"
        aria-selected={isActive}
        disabled={disabled}
        onClick={() => setActiveTab(value)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-500 hover:text-slate-700',
          disabled && 'opacity-40 cursor-not-allowed',
          className,
        )}
      >
        {children}
        {badge !== undefined && (
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center',
            isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500',
          )}>
            {badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap',
        'border-b-2 transition-all duration-150',
        isActive
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      {children}
      {badge !== undefined && (
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center leading-none',
          isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500',
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
}
