import React from 'react';
import { Card } from './Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'yellow';
  gradient?: boolean;
  className?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ 
    title, 
    value, 
    subtitle,
    trend,
    icon,
    color = 'blue',
    gradient = true,
    className = '',
    ...props 
  }, ref) => {
    const colorClasses = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-600',
        icon: 'bg-blue-500'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-green-100',
        border: 'border-green-200',
        text: 'text-green-600',
        icon: 'bg-green-500'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-600',
        icon: 'bg-purple-500'
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-600',
        icon: 'bg-orange-500'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-red-100',
        border: 'border-red-200',
        text: 'text-red-600',
        icon: 'bg-red-500'
      },
      pink: {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
        border: 'border-pink-200',
        text: 'text-pink-600',
        icon: 'bg-pink-500'
      },
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        icon: 'bg-yellow-500'
      }
    };
    
    const selectedColor = colorClasses[color];
    
    return (
      <Card
        ref={ref}
        className={`relative overflow-hidden backdrop-blur-sm ${
          gradient ? selectedColor.bg : 'bg-white'
        } ${selectedColor.border} border-2 hover:shadow-xl transition-all duration-300 hover:scale-105 ${className}`}
        {...props}
      >
        {/* Background gradient overlay */}
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        )}
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <div className="flex items-baseline space-x-2">
                <p className={`text-3xl font-bold ${selectedColor.text}`}>
                  {value}
                </p>
                {trend && (
                  <span className={`text-sm font-medium ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.isPositive ? '+' : ''}{trend.value}%
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            
            {icon && (
              <div className={`w-12 h-12 rounded-full ${selectedColor.icon} flex items-center justify-center text-white`}>
                {icon}
              </div>
            )}
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-12 -translate-x-12" />
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export { StatsCard }; 