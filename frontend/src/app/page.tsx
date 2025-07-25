import Link from 'next/link';
import { Bot, MessageSquare, Users, Zap } from 'lucide-react';
import SimpleThemeToggle from '@/components/SimpleThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Lyzr Support</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* <SimpleThemeToggle /> */}
              <Link
                href="/auth/login"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI-Powered Customer Support
            <span className="text-blue-600 dark:text-blue-400 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create intelligent support agents powered by Lyzr AI. Deploy chat widgets on any website in minutes. 
            No coding required, just plug and play.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Start Free Trial
            </Link>
            <Link
              href="/demo"
              className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Chat Widgets</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Embed intelligent chat widgets on any website with a simple script tag.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <Users className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">User Management</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Manage conversations, tickets, and customer interactions in one place.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <Zap className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Plug & Play</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create agents, customize appearance, and deploy in minutes. No technical skills needed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}