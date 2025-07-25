'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Only render after mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <div className="p-2 rounded-md w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="p-2 rounded-md w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="p-2 rounded-md w-8 h-8 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    );
  }

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => {
            console.log('Theme button clicked:', value); // Debug log
            setTheme(value);
          }}
          className={`
            p-2 rounded-md transition-colors text-sm font-medium
            ${theme === value 
              ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }
          `}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
