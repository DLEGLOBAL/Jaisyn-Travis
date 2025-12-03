
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20",
    xl: "h-32 md:h-48"
  };

  return (
    <img 
      src="https://storage.googleapis.com/charactersprites/Gemini_Generated_Image_hsqj5vhsqj5vhsqj.png" 
      alt="LovePop Logo" 
      className={`object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] ${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
