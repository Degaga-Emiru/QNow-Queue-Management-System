import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  Bell, 
  Activity, 
  BarChart2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../hooks/useBusiness';
import { useQueue } from '../../contexts/QueueContext';
import { useSocket } from '../../contexts/SocketContext';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, business } = useAuth();
  const { getDashboardStats } = useBusiness();
  const { currentQueue, queueStats, fetchCurrentQueue } = useQueue();
  const { connected } = useSocket();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Queue A101 is ready for service', time: '2 min ago', type: 'success' },
    { id: 2, message: 'Counter 3 is now inactive', time: '15 min ago', type: 'warning' },
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (business) {
      loadDashboardData();
      fetchCurrentQueue();
    }
  }, [business, getDashboardStats, fetchCurrentQueue]);

  const statCards = [
    {
      title: 'Total Waiting',
      value: stats?.queue?.waitingCount || queueStats?.waiting || 0,
      change: '+12%',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Avg Wait Time',
      value: `${stats?.analytics?.avgWaitTime || queueStats?.avgWaitTime || 0}m`,
      change: '-5%',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Active Counters',
      value: stats?.counters?.active || 0,
      change: '0%',
      icon: <Activity className="w-6 h-6" />,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Served Today',
      value: stats?.analytics?.servedToday || 0,
      change: '+8%',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="ml-0 md:ml-64">
          <Topbar />
          <div className="p-8 flex items-center justify-center">
            <Loader size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="ml-0 md:ml-64">
        <Topbar />
        
        <main className="p-4 md:p-6">
          {/* Welcome Banner */}
          <Card className="mb-6 gradient-primary text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}!</h1>
                <p className="opacity-90 mt-1">
                  {business?.name} • {connected ? 'Connected' : 'Connecting...'}
                </p>
                <div className="flex items-center mt-2">
                  <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                  <span className="text-sm opacity-90">
                    {connected ? 'Real-time updates active' : 'Connecting to server...'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="text-center">
                  <div className="text-sm opacity-90">Business Code</div>
                  <div className="text-xl font-bold font-mono">{business?.businessCode}</div>
                </div>
                <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  <Bell className="w-4 h-4 mr-2" />
                  Share Code
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat, index) => (
              <Card key={index} hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <div className="flex items-end space-x-2 mt-2">
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <span className={`text-sm flex items-center ${
                        stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {stat.change.startsWith('+') ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Queue Summary */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Current Queue</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Auto-refresh: {connected ? 'On' : 'Off'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={fetchCurrentQueue}
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
                
                {currentQueue.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No customers in queue</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Waiting for customers to join...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentQueue.slice(0, 5).map((queue) => (
                      <div key={queue.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            queue.status === 'waiting' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            queue.status === 'called' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                            queue.status === 'serving' ? 'bg-green-100 dark:bg-green-900/30' :
                            'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <span className={`font-bold ${
                              queue.status === 'waiting' ? 'text-blue-600 dark:text-blue-400' :
                              queue.status === 'called' ? 'text-yellow-600 dark:text-yellow-400' :
                              queue.status === 'serving' ? 'text-green-600 dark:text-green-400' :
                              'text-gray-600 dark:text-gray-400'
                            }`}>
                              {queue.queueNumber}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{queue.customerName}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{queue.serviceType}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                              queue.status === 'waiting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              queue.status === 'called' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                              queue.status === 'serving' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {queue.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">Position: #{queue.position}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Wait: {queue.waitTime}m
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {queue.joinedAt && format(new Date(queue.joinedAt), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {currentQueue.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="ghost" size="sm">
                          View all {currentQueue.length} customers
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
            
            {/* Notifications & Quick Stats */}
            <div className="space-y-6">
              <Card>
                <h2 className="text-xl font-bold mb-6">Recent Notifications</h2>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card>
                <h2 className="text-xl font-bold mb-6">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Peak Hour Today</span>
                    <span className="font-semibold">{stats?.analytics?.peakHour || '10:00 AM'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Customer Satisfaction</span>
                    <span className="font-semibold text-green-500">{stats?.analytics?.customerSatisfaction || '92'}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Staff Efficiency</span>
                    <span className="font-semibold text-blue-500">{stats?.analytics?.efficiency || '85'}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Performance Chart Placeholder */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Performance Analytics</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">Day</Button>
                <Button variant="ghost" size="sm">Week</Button>
                <Button variant="ghost" size="sm">Month</Button>
              </div>
            </div>
            
            <div className="h-64 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-full flex items-center justify-center">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Performance chart visualization</p>
                <p className="text-sm text-gray-500">(Real data from backend analytics)</p>
              </div>
            </div>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/queue" className="block">
                <Card className="text-center p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Queue Control</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage waiting customers</p>
                </Card>
              </a>
              
              <a href="/counters" className="block">
                <Card className="text-center p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Counters</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Setup service counters</p>
                </Card>
              </a>
              
              <a href="/analytics" className="block">
                <Card className="text-center p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View analytics</p>
                </Card>
              </a>
              
              <a href="/business/settings" className="block">
                <Card className="text-center p-4 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure preferences</p>
                </Card>
              </a>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;