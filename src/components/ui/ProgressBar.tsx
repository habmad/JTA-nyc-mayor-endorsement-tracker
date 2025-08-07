import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'custom' | 'yellow';
  customColor?: string;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ 
    value, 
    max, 
    color = 'blue', 
    customColor,
    height = 'md',
    showLabel = false,
    animated = true,
    className = '',
    ...props 
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    const heightClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4'
    };
    
    const colorClasses = {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
      red: 'bg-gradient-to-r from-red-500 to-red-600',
      yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      custom: ''
    };
    
    const progressStyle = customColor 
      ? { background: customColor }
      : {};
    
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{value}/{max}</span>
          </div>
        )}
        <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[height]}`}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              animated ? 'animate-pulse' : ''
            } ${colorClasses[color]}`}
            style={{
              width: `${percentage}%`,
              ...progressStyle
            }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar }; 