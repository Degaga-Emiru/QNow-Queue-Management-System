import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Bell, 
  BellOff, 
  QrCode, 
  MapPin, 
  Shield, 
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useQueue } from '../../contexts/QueueContext';
import { businessAPI } from '../../api/business';
import { queueAPI } from '../../api/queue';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CustomerQueue = () => {
  const { businessCode, queueNumber } = useParams();
  const [step, setStep] = useState(businessCode ? 2 : 1);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [joinData, setJoinData] = useState({
    businessId: '',
    serviceType: 'general',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [notifyMe, setNotifyMe] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchCode, setSearchCode] = useState(businessCode || '');
  
  const { user, isAuthenticated } = useAuth();
  const { joinQueue, getQueueStatus } = useQueue();
  const { socket, connected, subscribe } = useSocket();
  const navigate = useNavigate();

  // Load business info if businessCode is provided
  useEffect(() => {
    if (businessCode) {
      loadBusinessInfo(businessCode);
    }
  }, [businessCode]);

  // Load queue status if queueNumber is provided
  useEffect(() => {
    if (businessCode && queueNumber) {
      loadQueueStatus(businessCode, queueNumber);
    }
  }, [businessCode, queueNumber]);

  // Setup socket subscription for queue updates
  useEffect(() => {
    if (!connected || !socket || !queueData) return;

    const unsubscribe = subscribe('queue-updated', (data) => {
      if (data.queue?.queueNumber === queueData?.queueNumber) {
        // Update queue data when it changes
        if (data.type === 'customer_called') {
          toast.success(`Your turn! Please proceed to ${data.counter.name}`);
          setQueueData(prev => ({
            ...prev,
            status: 'called',
            counterId: data.counter.id,
            counterName: data.counter.name
          }));
        } else if (data.type === 'customer_completed') {
          toast.success('Service completed. Thank you for your visit!');
          setQueueData(prev => ({
            ...prev,
            status: 'completed'
          }));
        }
      }
    });

    return unsubscribe;
  }, [connected, socket, subscribe, queueData]);

  const loadBusinessInfo = async (code) => {
    try {
      setLoading(true);
      const business = await businessAPI.getBusinessByCode(code);
      setBusinessInfo(business);
      setJoinData(prev => ({
        ...prev,
        businessId: business.id,
        customerName: user?.fullName || '',
        customerEmail: user?.email || ''
      }));
    } catch (error) {
      toast.error('Business not found');
      navigate('/customer');
    } finally {
      setLoading(false);
    }
  };

  const loadQueueStatus = async (code, number) => {
    try {
      setLoading(true);
      const response = await getQueueStatus(code, number);
      setQueueData(response.queue);
      setStep(3);
    } catch (error) {
      toast.error('Queue not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBusiness = async () => {
    if (!searchCode.trim()) {
      toast.error('Please enter a business code');
      return;
    }

    try {
      setLoading(true);
      const business = await businessAPI.getBusinessByCode(searchCode);
      setBusinessInfo(business);
      setJoinData(prev => ({
        ...prev,
        businessId: business.id,
        customerName: user?.fullName || '',
        customerEmail: user?.email || ''
      }));
      setStep(2);
    } catch (error) {
      toast.error('Business not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!joinData.customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      setJoining(true);
      const response = await joinQueue(joinData);
      setQueueData(response.queue);
      
      // Join queue room for real-time updates
      if (socket && connected) {
        socket.emit('join-queue', response.queue.id);
      }
      
      setStep(3);
      toast.success(`Joined successfully! Your queue number: ${response.queue.queueNumber}`);
    } catch (error) {
      console.error('Failed to join queue:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (businessCode && queueData?.queueNumber) {
      try {
        const response = await getQueueStatus(businessCode, queueData.queueNumber);
        setQueueData(response.queue);
      } catch (error) {
        console.error('Failed to refresh status:', error);
      }
    }
  };

  const renderStep1 = () => (
    <Card className="p-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Enter Business Code</h2>
          
          <div className="space-y-6">
            <Input
              label="Business Code"
              placeholder="e.g., HOSP-1234"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              icon={MapPin}
              required
            />
            
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
              <span className="text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
            </div>
            
            <div className="text-center">
              <div 
                className="w-24 h-24 mx-auto mb-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => setShowQRModal(true)}
              >
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Scan QR code with your camera</p>
              <Button variant="outline" onClick={() => setShowQRModal(true)}>
                Open QR Scanner
              </Button>
            </div>
            
            <Button onClick={handleSearchBusiness} loading={loading} className="w-full">
              Find Business
            </Button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>No Registration Needed</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Enter Code',
                description: 'Get the business code from the counter or signage',
              },
              {
                step: '2',
                title: 'Join Queue',
                description: 'Join remotely and get your queue number',
              },
              {
                step: '3',
                title: 'Track Progress',
                description: 'Monitor your position and estimated wait time',
              },
              {
                step: '4',
                title: 'Get Notified',
                description: 'Receive alerts when your turn is approaching',
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold mb-2">Pro Tip</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can join multiple queues simultaneously and manage them from your phone.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderStep2 = () => {
    if (!businessInfo) return null;

    return (
      <div className="space-y-6">
        {/* Business Info */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{businessInfo.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{businessInfo.category}</p>
              <div className="flex items-center mt-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Code: <span className="font-mono">{businessInfo.businessCode}</span>
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Currently Open</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {businessInfo.stats?.waitingCount || 0} people waiting
              </div>
            </div>
          </div>
        </Card>
        
        {/* Join Form */}
        <Card className="p-8">
          <h3 className="text-xl font-bold mb-6">Join Queue</h3>
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Your Name"
                name="customerName"
                value={joinData.customerName}
                onChange={(e) => setJoinData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
              
              <Input
                label="Phone Number (Optional)"
                name="customerPhone"
                type="tel"
                value={joinData.customerPhone}
                onChange={(e) => setJoinData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="For SMS notifications"
              />
            </div>
            
            <Input
              label="Email (Optional)"
              name="customerEmail"
              type="email"
              value={joinData.customerEmail}
              onChange={(e) => setJoinData(prev => ({ ...prev, customerEmail: e.target.value }))}
              placeholder="For email notifications"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Type
              </label>
              <select
                value={joinData.serviceType}
                onChange={(e) => setJoinData(prev => ({ ...prev, serviceType: e.target.value }))}
                className="input-field"
              >
                {businessInfo.counters?.map(counter => (
                  <option key={counter.id} value={counter.serviceType}>
                    {counter.serviceType} (Counter {counter.number})
                  </option>
                )) || <option value="general">General Service</option>}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={joinData.notes}
                onChange={(e) => setJoinData(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field"
                rows="3"
                placeholder="Any special requirements..."
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                {notifyMe ? (
                  <Bell className="w-5 h-5 text-primary" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-semibold">Notify When I'm Near</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get notified when you're 3 positions away
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifyMe(!notifyMe)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  notifyMe ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifyMe ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleJoinQueue} loading={joining} className="flex-1">
                Join Queue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderStep3 = () => {
    if (!queueData || !businessInfo) return null;

    const progress = Math.max(0, Math.min(100, 
      ((queueData.position - 1) / Math.max(queueData.position, 1)) * 100
    ));

    return (
      <div className="space-y-6">
        {/* Business Info */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{businessInfo.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {queueData.serviceType || 'General Service'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                queueData.status === 'waiting' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                queueData.status === 'called' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                queueData.status === 'serving' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {queueData.status.charAt(0).toUpperCase() + queueData.status.slice(1)}
              </span>
            </div>
          </div>
        </Card>
        
        {/* Queue Status */}
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              {/* Progress Circle */}
              <div className="absolute inset-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0057A4" />
                      <stop offset="100%" stopColor="#00A4E4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold gradient-text">{queueData.queueNumber}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your Number</div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">You're in the queue!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your position and estimated wait time below
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold gradient-text">{queueData.position}</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Your Position</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold gradient-text">{queueData.waitingCount || 0}</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Ahead of You</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold gradient-text">{queueData.estimatedTime || 0}</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Est. Wait (min)</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold gradient-text">{businessInfo.stats?.activeCounters || 0}</div>
              <div className="text-gray-600 dark:text-gray-400 mt-1">Active Counters</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Your progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Active Counters */}
          <div className="mb-8">
            <h4 className="font-semibold mb-4">Active Counters</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {businessInfo.counters?.map((counter) => (
                <div key={counter.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold">{counter.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      counter.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : counter.status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {counter.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Currently Serving:
                  </div>
                  <div className="text-2xl font-bold gradient-text">
                    {counter.currentQueueNumber || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" onClick={handleRefreshStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
            <Button variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </Button>
            <Button className="flex-1">
              Share Status
            </Button>
          </div>
        </Card>
        
        {/* What to Expect */}
        <Card>
          <h4 className="font-semibold mb-4">What to Expect</h4>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h5 className="font-medium">You'll get notified</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When you're 3 positions away and when it's your turn
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h5 className="font-medium">Proceed when called</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Go to the assigned counter when your number is called
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h5 className="font-medium">Estimated wait time</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on current queue length and active counters
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      );
    }

    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              {step === 3 ? 'Your Queue Status' : 'Join Queue'}
              {step === 3 && queueData && (
                <span className="gradient-text ml-2">#{queueData.queueNumber}</span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 1 && 'Enter business code or scan QR code to join queue remotely'}
              {step === 2 && businessInfo && `Joining queue at ${businessInfo.name}`}
              {step === 3 && queueData && 'Track your position and estimated wait time'}
            </p>
          </div>
          
          {renderContent()}
          
          {/* QR Scanner Modal */}
          <Modal
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            title="Scan QR Code"
          >
            <div className="text-center p-8">
              <div className="w-48 h-48 mx-auto mb-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Point your camera at the business QR code
              </p>
              <div className="space-y-3">
                <Button className="w-full">
                  Open Camera
                </Button>
                <Button variant="outline" onClick={() => setShowQRModal(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerQueue;