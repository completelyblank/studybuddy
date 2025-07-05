import React from 'react';
import { cn } from '../../utils/cn';

interface HeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={cn('text-center py-12 lg:py-20', className)}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
};

export default Hero; 