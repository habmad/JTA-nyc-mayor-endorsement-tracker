import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'category' | 'confidence' | 'influence';
  category?: 'politician' | 'union' | 'celebrity' | 'media' | 'business' | 'nonprofit' | 'academic' | 'religious';
  confidence?: 'confirmed' | 'reported' | 'rumored';
  influence?: 'high' | 'medium' | 'low';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = '', variant = 'default', category, confidence, influence, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground',
      category: getCategoryColor(category),
      confidence: getConfidenceColor(confidence),
      influence: getInfluenceColor(influence)
    };
    
    return (
      <span
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

function getCategoryColor(category?: string) {
  const colors = {
    politician: 'bg-blue-500 text-white',
    union: 'bg-red-500 text-white',
    celebrity: 'bg-purple-500 text-white',
    media: 'bg-yellow-500 text-white',
    business: 'bg-green-500 text-white',
    nonprofit: 'bg-pink-500 text-white',
    academic: 'bg-indigo-500 text-white',
    religious: 'bg-gray-500 text-white'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-500 text-white';
}

function getConfidenceColor(confidence?: string) {
  const colors = {
    confirmed: 'bg-green-500 text-white',
    reported: 'bg-yellow-500 text-white',
    rumored: 'bg-gray-500 text-white'
  };
  return colors[confidence as keyof typeof colors] || 'bg-gray-500 text-white';
}

function getInfluenceColor(influence?: string) {
  const colors = {
    high: 'bg-purple-500 text-white',
    medium: 'bg-blue-500 text-white',
    low: 'bg-gray-500 text-white'
  };
  return colors[influence as keyof typeof colors] || 'bg-gray-500 text-white';
}

export { Badge }; 