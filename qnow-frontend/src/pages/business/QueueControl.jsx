import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  SkipForward,
  ArrowRightLeft,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { useQueue } from '../../contexts/QueueContext';
import { countersAPI } from '../../api/counters';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const QueueControl = () => {
  const { business } = useAuth();
  const { 
    currentQueue, 
    queueStats, 
    loading, 
    fetchCurrentQueue, 
    callNextCustomer, 
    startServing, 
    completeService, 
    skipCustomer,
    transferQueue
  } = useQueue();
  
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [skipReason, setSkipReason] = useState('');

  useEffect(() => {
    fetchCurrentQueue();
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      const response = await countersAPI.getCounters({ activeOnly: true });
      setCounters(response.counters || []);
      if (response.counters.length > 0) {
        setSelectedCounter(response.counters[0].id);
      }
    } catch (error) {
      console.error('Failed to load counters:', error);
    }
  };

  const handleCallNext = async () => {
    try {
      await callNextCustomer({ counterId: selectedCounter });
      setShowCallModal(false);
    } catch (error) {
      console.error('Failed to call next:', error);
    }
  };

  const handleStartServing = async (queueId) => {
    try {
      await startServing(queueId);
    } catch (error) {
      console.error('Failed to start serving:', error);
    }
  };

  const handleComplete = async (queueId) => {
    try {
      await completeService(queueId);
    } catch (error) {
      console.error('Failed to complete:', error);
    }
  };

  const handleSkip = async () => {
    if (!selectedQueue) return;
    try {
      await skipCustomer(selectedQueue.id, skipReason);
      setShowSkipModal(false);
      setSkipReason('');
    } catch (error) {
      console.error('Failed to skip:', error);
    }
  };

  const handleTransfer = async () => {
    if (!selectedQueue || !selectedCounter) return;
    try {
      await transferQueue({
        queueId: selectedQueue.id,
        toCounterId: selectedCounter
      });
      setShowTransferModal(false);
    } catch (error) {
      console.error('Failed to transfer:', error);
    }
  };

  const filteredQueue = currentQueue.filter(queue => {
    const matchesSearch = 
      queue.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.queueNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || queue.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      waiting: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Waiting' },
      called: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Called' },
      serving: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Serving' },
      completed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Completed' },
      skipped: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Skipped' },
    };
    
    const config = statusConfig[status] || statusConfig.waiting;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCounterName = (counterId) => {
    const counter = counters.find(c => c.id === counterId);
    return counter ? counter.name : 'Unknown';
  };

  if (loading && currentQueue.length === 0) {
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Queue Control</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your customers in real-time
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  {queueStats?.waiting || 0} waiting • {queueStats?.serving || 0} serving
                </span>
              </div>
              <Button
                variant="outline"
                onClick={fetchCurrentQueue}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCallModal(true)}>
                Call Next
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {queueStats?.waiting || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Waiting</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {queueStats?.called || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Called</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {queueStats?.serving || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Serving</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {queueStats?.completed || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or queue number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="input-field py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="waiting">Waiting</option>
                    <option value="called">Called</option>
                    <option value="serving">Serving</option>
                  </select>
                </div>
                
                <select
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="">All Counters</option>
                  {counters.map(counter => (
                    <option key={counter.id} value={counter.id}>
                      {counter.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
          
          {/* Queue Table */}
          <Card>
            {filteredQueue.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try a different search term' : 'Waiting for customers to join...'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Queue #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Service</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Position</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Wait Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Counter</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((queue) => (
                      <tr key={queue.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="font-bold text-lg">{queue.queueNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold">{queue.customerName}</div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {queue.customerPhone && (
                              <>
                                <Phone className="w-3 h-3 mr-1" />
                                {queue.customerPhone}
                              </>
                            )}
                            {queue.customerEmail && (
                              <>
                                <Mail className="w-3 h-3 ml-2 mr-1" />
                                {queue.customerEmail}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                            {queue.serviceType}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(queue.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-2xl font-bold">#{queue.position}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {queue.waitTime}m
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {queue.counterId ? (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                              {getCounterName(queue.counterId)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {queue.status === 'waiting' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedQueue(queue);
                                  setShowCallModal(true);
                                }}
                              >
                                Call
                              </Button>
                            )}
                            
                            {queue.status === 'called' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartServing(queue.id)}
                              >
                                Start
                              </Button>
                            )}
                            
                            {queue.status === 'serving' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleComplete(queue.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedQueue(queue);
                                setShowSkipModal(true);
                              }}
                            >
                              <SkipForward className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedQueue(queue);
                                setShowTransferModal(true);
                              }}
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          
          {/* Call Next Modal */}
          <Modal
            isOpen={showCallModal}
            onClose={() => setShowCallModal(false)}
            title="Call Next Customer"
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Counter
                </label>
                <select
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select a counter</option>
                  {counters.map(counter => (
                    <option key={counter.id} value={counter.id}>
                      {counter.name} ({counter.status})
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedQueue && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Customer</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{selectedQueue.queueNumber}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedQueue.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Position: #{selectedQueue.position}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Wait: {selectedQueue.waitTime}m
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowCallModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCallNext} disabled={!selectedCounter}>
                  Call Customer
                </Button>
              </div>
            </div>
          </Modal>
          
          {/* Skip Customer Modal */}
          <Modal
            isOpen={showSkipModal}
            onClose={() => {
              setShowSkipModal(false);
              setSkipReason('');
            }}
            title="Skip Customer"
          >
            <div className="space-y-6">
              {selectedQueue && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{selectedQueue.queueNumber}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedQueue.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Position: #{selectedQueue.position}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for skipping (optional)
                </label>
                <textarea
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value)}
                  className="input-field w-full"
                  rows="3"
                  placeholder="Enter reason..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSkipModal(false);
                    setSkipReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleSkip}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Skip Customer
                </Button>
              </div>
            </div>
          </Modal>
          
          {/* Transfer Queue Modal */}
          <Modal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            title="Transfer Queue"
          >
            <div className="space-y-6">
              {selectedQueue && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{selectedQueue.queueNumber}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedQueue.customerName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Current Counter: {getCounterName(selectedQueue.counterId)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transfer to Counter
                </label>
                <select
                  value={selectedCounter}
                  onChange={(e) => setSelectedCounter(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select counter</option>
                  {counters
                    .filter(counter => counter.id !== selectedQueue?.counterId)
                    .map(counter => (
                      <option key={counter.id} value={counter.id}>
                        {counter.name} ({counter.serviceType})
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTransfer} disabled={!selectedCounter}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transfer Queue
                </Button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default QueueControl;