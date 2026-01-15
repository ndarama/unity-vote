'use client';

import React, { useEffect } from 'react';
import { X, Check, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-orange-600 focus:ring-brand-orange",
    secondary: "bg-brand-navy text-white hover:bg-slate-800 focus:ring-brand-navy",
    outline: "border-2 border-brand-navy text-brand-navy hover:bg-brand-navy/10",
    ghost: "text-brand-grey hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-brand-grey mb-1">{label}</label>}
      <input
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all ${error ? 'border-red-500' : 'border-gray-300'} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  // If title is undefined, we assume "Custom Mode" (No header, no padding, floating close button)
  const isCustomMode = title === undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative`}>
        {isCustomMode ? (
          <>
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-20 p-2 bg-white/60 hover:bg-white text-brand-grey hover:text-brand-navy rounded-full backdrop-blur-md transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto flex-1">
               {children}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
              <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-brand-grey" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- Captcha Mock ---
export const MockCaptcha: React.FC<{ onVerify: (isValid: boolean) => void }> = ({ onVerify }) => {
  const [checked, setChecked] = React.useState(false);
  
  const handleCheck = () => {
    setChecked(true);
    setTimeout(() => onVerify(true), 500);
  };

  return (
    <div className="flex items-center p-3 border rounded-lg bg-gray-50 select-none cursor-pointer hover:bg-gray-100 transition-colors" onClick={!checked ? handleCheck : undefined}>
      <div className={`w-6 h-6 border-2 rounded mr-3 flex items-center justify-center ${checked ? 'bg-green-500 border-green-500' : 'border-gray-400 bg-white'}`}>
        {checked && <Check className="w-4 h-4 text-white" />}
      </div>
      <span className="text-sm text-brand-grey font-medium">I am human</span>
    </div>
  );
};

// --- Toast Notification ---
export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: <CheckCircle2 className="w-5 h-5 text-green-600" /> },
    error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: <AlertCircle className="w-5 h-5 text-red-600" /> },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: <Info className="w-5 h-5 text-blue-600" /> }
  };
  
  const style = styles[type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full animate-in slide-in-from-right duration-300 ${style.bg} ${style.border} ${style.text}`}>
      <div className="shrink-0 mt-0.5">{style.icon}</div>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ notifications: {id: string, type: 'success'|'error'|'info', message: string}[], removeNotification: (id: string) => void }> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-24 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="pointer-events-auto">
          <Toast {...n} onClose={removeNotification} />
        </div>
      ))}
    </div>
  );
};
