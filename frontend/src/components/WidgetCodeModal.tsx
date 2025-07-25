'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Agent {
  _id: string;
  name: string;
  widget: {
    theme: 'light' | 'dark';
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    welcomeMessage: string;
    placeholder: string;
    title: string;
  };
}

interface WidgetCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

export default function WidgetCodeModal({ isOpen, onClose, agent }: WidgetCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateWidgetCode = () => {
    // Use the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix to get base URL
    
    return `<!-- Lyzr Support Chat Widget -->
<script 
  src="${baseUrl}/api/widget/${agent._id}/widget.js"
  data-agent-id="${agent._id}"
  data-title="${agent.widget.title}"
  data-welcome-message="${agent.widget.welcomeMessage}"
  data-placeholder="${agent.widget.placeholder}"
  data-theme="${agent.widget.theme}"
  data-primary-color="${agent.widget.primaryColor}"
  data-position="${agent.widget.position}"
></script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateWidgetCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-0 border w-full max-w-3xl shadow-lg rounded-md bg-white m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Widget Code for "{agent.name}"
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Copy and paste this code into your website's HTML, preferably before the closing &lt;/body&gt; tag:
            </p>
          </div>

          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generateWidgetCode()}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Integration Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Add this code to any webpage where you want the chat widget to appear</li>
              <li>The widget will automatically load and position itself according to your settings</li>
              <li>Make sure your agent is active for the widget to work properly</li>
              <li>Test the widget on your website to ensure it's working correctly</li>
            </ul>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">Widget Preview:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-yellow-900">Theme:</span>
                <span className="ml-2 text-yellow-800 capitalize">{agent.widget.theme}</span>
              </div>
              <div>
                <span className="font-medium text-yellow-900">Position:</span>
                <span className="ml-2 text-yellow-800 capitalize">{agent.widget.position.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-yellow-900">Primary Color:</span>
                <span className="ml-2 text-yellow-800">{agent.widget.primaryColor}</span>
                <div 
                  className="ml-2 inline-block w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: agent.widget.primaryColor }}
                ></div>
              </div>
              <div>
                <span className="font-medium text-yellow-900">Title:</span>
                <span className="ml-2 text-yellow-800">"{agent.widget.title}"</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
