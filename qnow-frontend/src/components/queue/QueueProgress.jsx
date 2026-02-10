import React from 'react';
import { Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';

const QueueProgress = ({ 
  position, 
  totalWaiting, 
  estimatedTime, 
  averageWaitTime,
  countersActive,
  size = 'md',
  showDetails = true 
}) => {
  const progress = totalWaiting > 0 
    ? Math.min(100, ((position - 1) / totalWaiting) * 100) 
    : 100;

  const sizeClasses = {
    sm: {
      circle: 'w-16 h-16',
      text: 'text-lg',
      detail: 'text-xs',
    },
    md: {
      circle: 'w-24 h-24',
      text: 'text-2xl',
      detail: 'text-sm',
    },
    lg: {
      circle: 'w-32 h-32',
      text: 'text-3xl',
      detail: 'text-base',
    },
    xl: {
      circle: 'w-48 h-48',
      text: 'text-4xl',
      detail: 'text-lg',
    },
  };

  const config = sizeClasses[size] || sizeClasses.md;

  const getProgressColor = (progress) => {
    if (progress < 30) return 'text-green-500';
    if (progress < 60) return 'text-yellow-500';
    if (progress < 90) return 'text-orange-500';
    return 'text-red-500';
  };

  const getWaitTimeStatus = (estimatedTime) => {
    if (estimatedTime <= 10) return { color: 'text-green-500', label: 'Short' };
    if (estimatedTime <= 30) return { color: 'text-yellow-500', label: 'Medium' };
    return { color: 'text-red-500', label: 'Long' };
  };

  const waitTimeStatus = getWaitTimeStatus(estimatedTime);

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative mb-6">
        <div className={config.circle}>
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              className="dark:stroke-gray-700"
            />
            {/* Progress circle */}
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
              className="transition-all duration-500"
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
          <div className={`font-bold ${config.text} gradient-text`}>
            #{position}
          </div>
          <div className={`${config.detail} text-gray-600 dark:text-gray-400`}>
            Position
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="w-full space-y-4">
          {/* Wait Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Est. Wait</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${waitTimeStatus.color}`}>
                {estimatedTime} min
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${waitTimeStatus.color} bg-opacity-10`}>
                {waitTimeStatus.label}
              </span>
            </div>
          </div>

          {/* People Ahead */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Ahead of You</span>
            </div>
            <span className="font-semibold">{totalWaiting}</span>
          </div>

          {/* Active Counters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Active Counters</span>
            </div>
            <span className="font-semibold">{countersActive}</span>
          </div>

          {/* Average Wait */}
          {averageWaitTime && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Avg. Wait</span>
              </div>
              <span className="font-semibold">{averageWaitTime} min</span>
            </div>
          )}

          {/* Progress Bar */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Joined</span>
              <span>Your Turn</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueProgress;