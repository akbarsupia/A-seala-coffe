'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from '@/components/shared/Toast';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((title: string, message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, title, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[400px] items-end">
        {notifications.map((n) => (
          <Toast 
            key={n.id} 
            {...n} 
            onClose={() => removeNotification(n.id)} 
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
