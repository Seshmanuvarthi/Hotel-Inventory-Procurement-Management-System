import React from 'react';

const SecondaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs sm:px-3 sm:py-2 sm:text-sm',
    md: 'px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base',
    lg: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${sizeClasses[size]}
        bg-card text-primary font-semibold rounded-lg
        border-2 border-primary
        shadow-luxury hover:shadow-luxury-lg
        transition-all duration-300
        hover:bg-primary hover:text-card hover:scale-105
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default SecondaryButton;
