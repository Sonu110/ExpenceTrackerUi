'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setShowBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setShowBanner(false);
      window.location.reload();
    } else {
      setShowBanner(true);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && !isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 top-0 z-[100] flex justify-center px-4 pt-4"
        >
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-2xl dark:border-red-900/50 dark:bg-red-950/90">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
              <WifiOff className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                No Internet Connection
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400/80">
                Please check your internet connection and try again.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="shrink-0 border-red-300 text-red-600 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
            >
              <RotateCw className="mr-1 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
