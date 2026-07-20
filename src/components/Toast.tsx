import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800 text-black dark:text-white';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bgColor = 'bg-white dark:bg-zinc-900 border-green-200 dark:border-green-950/30 text-zinc-800 dark:text-zinc-100';
            Icon = CheckCircle;
            iconColor = 'text-primary';
          } else if (toast.type === 'error') {
            bgColor = 'bg-white dark:bg-zinc-900 border-red-200 dark:border-red-950/30 text-zinc-800 dark:text-zinc-100';
            Icon = AlertCircle;
            iconColor = 'text-red-500';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`flex items-center gap-3 p-4 rounded-[16px] shadow-lg border ${bgColor}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
              <p className="text-sm font-medium flex-grow">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
