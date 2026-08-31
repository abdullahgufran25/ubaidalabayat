import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full">
        {toasts.map((toast) => {
          let bgColor = 'bg-green-50 border-green-200 text-green-800';
          let Icon = CheckCircle;

          if (toast.type === 'error') {
            bgColor = 'bg-red-50 border-red-200 text-red-800';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bgColor = 'bg-yellow-50 border-yellow-200 text-yellow-800';
            Icon = AlertTriangle;
          } else if (toast.type === 'info') {
            bgColor = 'bg-blue-50 border-blue-200 text-blue-800';
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start p-4 border rounded shadow-lg ${bgColor} animate-fade-in`}
              role="alert"
            >
              <Icon size={18} className="mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-semibold uppercase tracking-wider leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 hover:opacity-70 flex-shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
