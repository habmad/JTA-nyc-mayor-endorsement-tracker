import React from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ 
    data, 
    maxValue,
    height = 200,
    showValues = true,
    animated = true,
    className = '',
    ...props 
  }, ref) => {
    const max = maxValue || Math.max(...data.map(d => d.value));
    const colors = [
      'bg-gradient-to-t from-blue-500 to-blue-600',
      'bg-gradient-to-t from-green-500 to-green-600',
      'bg-gradient-to-t from-purple-500 to-purple-600',
      'bg-gradient-to-t from-orange-500 to-orange-600',
      'bg-gradient-to-t from-red-500 to-red-600',
      'bg-gradient-to-t from-pink-500 to-pink-600',
      'bg-gradient-to-t from-indigo-500 to-indigo-600',
      'bg-gradient-to-t from-yellow-500 to-yellow-600'
    ];
    
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        <div className="flex items-end justify-between h-full space-x-2" style={{ height }}>
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            const color = item.color || colors[index % colors.length];
            
            return (
              <div key={item.label} className="flex-1 flex flex-col items-center">
                <div className="w-full relative">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-1000 ease-out ${
                      animated ? 'animate-pulse' : ''
                    } ${color}`}
                    style={{ 
                      height: `${percentage}%`,
                      minHeight: '4px'
                    }}
                  />
                  {showValues && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                      {item.value}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-600 text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

BarChart.displayName = 'BarChart';

export { BarChart }; 