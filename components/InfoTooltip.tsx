import React, { useState } from 'react';

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        className="ml-2 w-4 h-4 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label="More information"
      >
        i
      </button>
      {isHovered && (
        <div className="absolute z-10 w-48 p-2 mt-1 text-xs text-gray-100 bg-gray-800 rounded-md shadow-lg -left-24">
          {text}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
