import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  Search,
  RefreshCw,
  Download,
  MoreVertical,
  Settings,
  Trash2,
  Edit
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import CounterCard from '../../components/queue/CounterCard';
import { useAuth } from '../../contexts/AuthContext';
import { countersAPI } from '../../api/counters';
import toast from 'react-hot-toast';

const Counters = () => {
  const { business } = useAuth();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    serviceType: 'general',
    settings: {
      autoCall: false,
      maxCustomersPerHour: 20,
      breakDuration: 15,
      breakFrequency: 120,
    },
  });

  useEffect(() => {
    fetchCounters();
  }, []);

  const fetchCounters = async () => {
    try {
      setLoading(true);
      const response = await countersAPI.getCounters();
      setCounters(response.counters || []);
    } catch (error) {
      toast.error('Failed to fetch counters');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCounter = async () => {
    try {
      const counterData = {
        ...formData,
        number: formData.number || counters.length + 1,
      };
      
      const response = await countersAPI.createCounter(counterData);
      setCounters(prev => [...prev, response.counter]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Counter created successfully');
    } catch (error) {
      toast.error('Failed to create counter');
    }
  };

  const handleUpdateCounter = async () => {
    if (!selectedCounter) return;
    
    try {
      const response = await countersAPI.updateCounter(selectedCounter.id, formData);
      setCounters(prev => prev.map(c => 
        c.id === selectedCounter.id ? response.counter : c
      ));
      setShowEditModal(false);
      resetForm();
      toast.success('Counter updated successfully');
    } catch (error) {
      toast.error('Failed to update counter');
    }
  };

  const handleDeleteCounter = async (counterId) => {
    if (!window.confirm('Are you sure you want to delete this counter?')) return;
    
    try {
      await countersAPI.deleteCounter(counterId);
      setCounters(prev => prev.filter(c => c.id !== counterId));
      toast.success('Counter deleted successfully');
    } catch (error) {
      toast.error('Failed to delete counter');
    }
  };

  const handleStatusChange = async (counterId, status) => {
    try {
      await countersAPI.setCounterStatus(counterId, status);
      setCounters(prev => prev.map(c => 
        c.id === counterId ? { ...c, status } : c
      ));
      toast.success('Counter status updated');
    } catch (error) {
      toast.error('Failed to update counter status');
    }
  };

  const handleBreak = async (counterId, duration) => {
    try {
      await countersAPI.setCounterBreak(counterId, duration);
      fetchCounters(); // Refresh to get updated status
      toast.success('Counter break started');
    } catch (error) {
      toast.error('Failed to set counter break');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      number: '',
      serviceType: 'general',
      settings: {
        autoCall: false,
        maxCustomersPerHour: 20,
        breakDuration: 15,
        breakFrequency: 120,
      },
    });
    setSelectedCounter(null);
  };

  const openEditModal = (counter) => {
    setSelectedCounter(counter);
    setFormData({
      name: counter.name,
      number: counter.number,
      serviceType: counter.serviceType,
      settings: counter.settings,
    });
    setShowEditModal(true);
  };

  const filteredCounters = counters.filter(counter => {
    const matchesSearch = 
      counter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      counter.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || counter.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const activeCounters = counters.filter(c => c.status === 'active').length;
  const busyCounters = counters.filter(c => c.status === 'busy').length;
  const onBreakCounters = counters.filter(c => c.status === 'break').length;

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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Counters Management</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your service counters and staff assignments
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={fetchCounters}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Counter
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {counters.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Counters</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {activeCounters}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {busyCounters}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Busy</div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {onBreakCounters}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Break</div>
              </div>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search counters by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    <option value="active">Active</option>
                    <option value="busy">Busy</option>
                    <option value="break">On Break</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Counters Grid */}
          {filteredCounters.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No counters found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery ? 'Try a different search term' : 'Get started by adding your first counter'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Counter
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCounters.map(counter => (
                <div key={counter.id} className="relative">
                  <CounterCard
                    counter={counter}
                    onStatusChange={handleStatusChange}
                    onBreak={handleBreak}
                    showActions
                  />
                  
                  {/* Actions Menu */}
                  <div className="absolute top-4 right-4">
                    <div className="relative group">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 hidden group-hover:block z-10 border border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => openEditModal(counter)}
                          className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCounter(counter.id)}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Create Counter Modal */}
          <Modal
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            title="Add New Counter"
            size="lg"
          >
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Counter Name"
                  placeholder="e.g., Registration Desk 1"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                
                <Input
                  label="Counter Number"
                  type="number"
                  placeholder="Auto-assigned if empty"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="general">General Service</option>
                  <option value="registration">Registration</option>
                  <option value="payment">Payment</option>
                  <option value="consultation">Consultation</option>
                  <option value="billing">Billing</option>
                  <option value="support">Customer Support</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">Counter Settings</h4>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Auto-call next customer
                  </label>
                  <button
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, autoCall: !prev.settings.autoCall }
                    }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      formData.settings.autoCall ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        formData.settings.autoCall ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <Input
                  label="Max Customers Per Hour"
                  type="number"
                  value={formData.settings.maxCustomersPerHour}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    settings: { ...prev.settings, maxCustomersPerHour: e.target.value }
                  }))}
                  min="1"
                  max="100"
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Break Duration (minutes)"
                    type="number"
                    value={formData.settings.breakDuration}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, breakDuration: e.target.value }
                    }))}
                    min="1"
                    max="60"
                  />
                  
                  <Input
                    label="Break Frequency (minutes)"
                    type="number"
                    value={formData.settings.breakFrequency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, breakFrequency: e.target.value }
                    }))}
                    min="30"
                    max="240"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateCounter}>
                  Create Counter
                </Button>
              </div>
            </div>
          </Modal>
          
          {/* Edit Counter Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            title="Edit Counter"
            size="lg"
          >
            {selectedCounter && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Counter Name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  
                  <Input
                    label="Counter Number"
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Type
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="general">General Service</option>
                    <option value="registration">Registration</option>
                    <option value="payment">Payment</option>
                    <option value="consultation">Consultation</option>
                    <option value="billing">Billing</option>
                    <option value="support">Customer Support</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateCounter}>
                    Update Counter
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default Counters;