import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = 'rounded-md px-4 py-2 font-medium transition-colors focus:outline-none';
  
  const variants = {
    primary: 'bg-brand-primary text-white hover:opacity-90',
    secondary: 'bg-bg-elevated text-secondary border border-subtle hover:border-default',
    danger: 'bg-status-error/10 text-status-error border border-status-error/20',
    ghost: 'text-muted hover:text-secondary hover:bg-bg-elevated'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
