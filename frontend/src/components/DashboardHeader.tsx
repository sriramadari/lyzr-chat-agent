'use client';

import { useAuthStore } from '@/stores/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Bot, Ticket, Users, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHeader() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'Agents', href: '/dashboard', icon: Bot, current: pathname === '/dashboard' },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket, current: pathname.startsWith('/dashboard/tickets') },
    { name: 'Users', href: '/dashboard/users', icon: Users, current: pathname.startsWith('/dashboard/users') },
    { name: 'Optimization', href: '/dashboard/optimization', icon: Settings, current: pathname.startsWith('/dashboard/optimization') },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Lyzr Support Dashboard
            </h1>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.subscription?.plan || 'Free'}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
