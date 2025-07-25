'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  MessageSquare,
  Star,
  Badge,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await userAPI.getUser(params.id as string);
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to fetch user details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
        <div className="mt-6">
          <button
            onClick={() => router.push('/dashboard/users')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/dashboard/users')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.user.name}</h1>
          <p className="text-gray-600">User Profile & Activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">
                  {user.user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">{user.user.name}</h3>
              <div className="mt-2 flex justify-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.user.role}
                </span>
              </div>
            </div>
            
            <dl className="mt-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Badge className="h-4 w-4 mr-2" />
                  Subscription
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.user.subscription?.plan === 'enterprise' ? 'bg-gold-100 text-gold-800' :
                    user.user.subscription?.plan === 'pro' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.user.subscription?.plan || 'free'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member Since
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(user.user.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Activity & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-lg font-bold text-gray-900">{user.stats.totalTickets}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-600">O</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Open</p>
                  <p className="text-lg font-bold text-gray-900">{user.stats.openTickets}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">R</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-lg font-bold text-gray-900">{user.stats.resolvedTickets}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                  <p className="text-lg font-bold text-gray-900">
                    {user.stats.avgSatisfaction ? user.stats.avgSatisfaction.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
            </div>
            <div className="overflow-x-auto">
              {user.tickets && user.tickets.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.tickets.map((ticket: any) => (
                      <tr key={ticket._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                          <div className="text-sm text-gray-500">{ticket.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticket.agentId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/dashboard/tickets/${ticket._id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                  <p className="text-gray-500">This user hasn't created any tickets yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
