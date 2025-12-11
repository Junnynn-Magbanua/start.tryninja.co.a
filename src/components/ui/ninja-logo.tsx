import React from 'react';

interface NinjaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const NinjaLogo: React.FC<NinjaLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
        <div className="flex space-x-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};