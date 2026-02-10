import React from 'react';
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import Button from '../ui/Button';
import { getStatusColor, formatRelativeTime } from '../../utils/helpers';

const QueueCard = ({ 
  queue, 
  onCall, 
  onComplete, 
  onSkip, 
  onTransfer,
  showActions = true,
  compact = false 
}) => {
  const getStatusText = (status) => {
    const statusMap = {
      waiting: 'Waiting',
      called: 'Called',
      serving: 'Serving',
      completed: 'Completed',
      skipped: 'Skipped',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-4 h-4" />;
      case 'called':
        return <AlertCircle className="w-4 h-4" />;
      case 'serving':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'skipped':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${getStatusColor(queue.status, 'all')} rounded-lg flex items-center justify-center`}>
            <span className="font-bold">{queue.queueNumber}</span>
          </div>
          <div>
            <h4 className="font-semibold">{queue.customerName}</h4>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                {getStatusIcon(queue.status)}
                <span className="ml-1">{getStatusText(queue.status)}</span>
              </span>
              <span className="mx-2">•</span>
              <span>Pos: #{queue.position}</span>
            </div>
          </div>
        </div>
        
        {showActions && queue.status === 'waiting' && (
          <Button size="sm" onClick={() => onCall?.(queue)}>
            Call
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${getStatusColor(queue.status, 'all')} rounded-lg flex items-center justify-center`}>
            <span className="font-bold text-lg">{queue.queueNumber}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(queue.status, 'all')}`}>
                {getStatusIcon(queue.status)}
                <span className="ml-1">{getStatusText(queue.status)}</span>
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Position: <span className="font-semibold">#{queue.position}</span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Joined {formatRelativeTime(queue.joinedAt)}
          </span>
          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg mb-1">{queue.customerName}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              {queue.customerPhone && (
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {queue.customerPhone}
                </span>
              )}
              {queue.customerEmail && (
                <span className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {queue.customerEmail}
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{queue.waitTime}m</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wait time</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Type</div>
            <div className="font-medium">{queue.serviceType}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Time</div>
            <div className="font-medium">{queue.estimatedTime || queue.waitTime} minutes</div>
          </div>
        </div>
        
        {queue.notes && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</div>
            <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
              {queue.notes}
            </div>
          </div>
        )}
        
        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {queue.status === 'waiting' && (
              <Button size="sm" onClick={() => onCall?.(queue)} className="flex-1">
                Call Customer
              </Button>
            )}
            
            {queue.status === 'called' && (
              <Button size="sm" variant="outline" onClick={() => onComplete?.(queue)} className="flex-1">
                Start Serving
              </Button>
            )}
            
            {queue.status === 'serving' && (
              <Button size="sm" onClick={() => onComplete?.(queue)} className="flex-1">
                Complete Service
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSkip?.(queue)}
            >
              Skip
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onTransfer?.(queue)}
            >
              Transfer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueCard;