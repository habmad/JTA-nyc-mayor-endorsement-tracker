import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom' | 'yellow';
  customColor?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    value, 
    max, 
    size = 'md',
    strokeWidth = 4,
    color = 'blue',
    customColor,
    showValue = true,
    animated = true,
    className = '',
    ...props 
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    const radius = 50 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const sizeClasses = {
      sm: 'w-16 h-16',
      md: 'w-24 h-24',
      lg: 'w-32 h-32',
      xl: 'w-40 h-40'
    };
    
    const colorClasses = {
      blue: 'stroke-blue-500',
      green: 'stroke-green-500',
      purple: 'stroke-purple-500',
      orange: 'stroke-orange-500',
      red: 'stroke-red-500',
      yellow: 'stroke-yellow-500',
      custom: ''
    };
    
    const strokeStyle = customColor 
      ? { stroke: customColor }
      : {};
    
    return (
      <div ref={ref} className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`} {...props}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClasses[color]} transition-all duration-1000 ease-out ${
              animated ? 'animate-pulse' : ''
            }`}
            style={strokeStyle}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { CircularProgress }; 