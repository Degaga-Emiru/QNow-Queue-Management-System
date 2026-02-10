import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Activity, 
  Pause, 
  Play,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { COUNTER_STATUS } from '../../utils/constants';
import { formatDuration } from '../../utils/helpers';

const CounterCard = ({ 
  counter, 
  onStatusChange, 
  onBreak, 
  onAssign,
  showActions = true,
  isAssigned = false 
}) => {
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakDuration, setBreakDuration] = useState(15);

  const getStatusConfig = (status) => {
    const configs = {
      [COUNTER_STATUS.ACTIVE]: {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: <Activity className="w-4 h-4" />,
        label: 'Active',
      },
      [COUNTER_STATUS.BUSY]: {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: <Clock className="w-4 h-4" />,
        label: 'Busy',
      },
      [COUNTER_STATUS.BREAK]: {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: <Pause className="w-4 h-4" />,
        label: 'On Break',
      },
      [COUNTER_STATUS.INACTIVE]: {
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-100 dark:bg-gray-800',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Inactive',
      },
    };
    
    return configs[status] || configs[COUNTER_STATUS.INACTIVE];
  };

  const handleBreak = () => {
    if (onBreak) {
      onBreak(counter.id, breakDuration);
      setShowBreakModal(false);
    }
  };

  const handleStatusToggle = () => {
    if (onStatusChange) {
      const newStatus = counter.status === COUNTER_STATUS.ACTIVE 
        ? COUNTER_STATUS.INACTIVE 
        : COUNTER_STATUS.ACTIVE;
      onStatusChange(counter.id, newStatus);
    }
  };

  const statusConfig = getStatusConfig(counter.status);

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${statusConfig.bg} rounded-lg flex items-center justify-center`}>
              <div className={statusConfig.color}>
                {statusConfig.icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">{counter.name}</h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  #{counter.number}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {counter.currentQueueNumber && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{counter.currentQueueNumber}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Current</div>
              </div>
            )}
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-4">
          <div className="space-y-4">
            {/* Service Type */}
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Type</div>
              <div className="font-medium">{counter.serviceType}</div>
            </div>
            
            {/* Staff */}
            {counter.staffName && (
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Staff</div>
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{counter.staffName}</span>
                </div>
              </div>
            )}
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Served Today</div>
                <div className="text-2xl font-bold">{counter.stats?.servedToday || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg. Time</div>
                <div className="text-2xl font-bold">{formatDuration(counter.stats?.avgServingTime || 0)}</div>
              </div>
            </div>
            
            {/* Current Queue */}
            {counter.currentQueueNumber && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Serving</div>
                    <div className="font-bold text-lg">{counter.currentQueueNumber}</div>
                  </div>
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            )}
            
            {/* Actions */}
            {showActions && (
              <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {counter.status === COUNTER_STATUS.ACTIVE && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => setShowBreakModal(true)}
                      className="flex-1"
                    >
                      Take Break
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleStatusToggle}
                    >
                      Deactivate
                    </Button>
                  </>
                )}
                
                {counter.status === COUNTER_STATUS.INACTIVE && (
                  <Button 
                    size="sm" 
                    onClick={handleStatusToggle}
                    className="flex-1"
                  >
                    Activate
                  </Button>
                )}
                
                {counter.status === COUNTER_STATUS.BREAK && (
                  <Button 
                    size="sm" 
                    onClick={() => onStatusChange?.(counter.id, COUNTER_STATUS.ACTIVE)}
                    className="flex-1"
                  >
                    End Break
                  </Button>
                )}
                
                {counter.status === COUNTER_STATUS.BUSY && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    disabled
                    className="flex-1"
                  >
                    Serving...
                  </Button>
                )}
                
                {onAssign && !counter.staffName && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onAssign(counter)}
                  >
                    Assign Staff
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Break Modal */}
      <Modal
        isOpen={showBreakModal}
        onClose={() => setShowBreakModal(false)}
        title="Set Break Duration"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Break Duration (minutes)
            </label>
            <div className="flex items-center space-x-4">
              {[5, 10, 15, 30].map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setBreakDuration(duration)}
                  className={`px-4 py-2 rounded-lg border ${
                    breakDuration === duration
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800 dark:text-yellow-300">
                Counter will be unavailable during break
              </span>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowBreakModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBreak}>
              Start Break
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CounterCard;