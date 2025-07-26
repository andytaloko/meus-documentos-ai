import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  priority: NotificationPriority;
  persistent?: boolean;
  read: boolean;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [queue, setQueue] = useState<Notification[]>([]);
  const processingQueue = useRef(false);

  const addNotification = useCallback((
    title: string,
    description?: string,
    type: NotificationType = 'info',
    priority: NotificationPriority = 'normal',
    persistent = false,
    action?: { label: string; onClick: () => void }
  ) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      title,
      description,
      type,
      priority,
      persistent,
      read: false,
      timestamp: new Date(),
      action
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Add to queue for processing
    setQueue(prev => {
      const newQueue = [...prev, notification];
      // Sort by priority (critical > high > normal > low)
      return newQueue.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    });

    return notification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setQueue([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const showToast = useCallback((notification: Notification) => {
    const variant = notification.type === 'error' ? 'destructive' : 'default';
    
    toast({
      title: notification.title,
      description: notification.description,
      variant
    });
  }, []);

  // Process notification queue
  const processQueue = useCallback(() => {
    if (processingQueue.current || queue.length === 0) return;

    processingQueue.current = true;
    const notification = queue[0];

    // Show toast for high priority or critical notifications
    if (['high', 'critical'].includes(notification.priority)) {
      showToast(notification);
    }

    // Remove from queue
    setQueue(prev => prev.slice(1));
    
    // Process next notification after delay
    setTimeout(() => {
      processingQueue.current = false;
      processQueue();
    }, 500);
  }, [queue, showToast]);

  // Auto-process queue
  useEffect(() => {
    processQueue();
  }, [queue, processQueue]);

  // Convenience methods for different notification types
  const success = useCallback((title: string, description?: string, persistent = false) => {
    return addNotification(title, description, 'success', 'normal', persistent);
  }, [addNotification]);

  const error = useCallback((title: string, description?: string, persistent = true) => {
    return addNotification(title, description, 'error', 'high', persistent);
  }, [addNotification]);

  const warning = useCallback((title: string, description?: string, persistent = false) => {
    return addNotification(title, description, 'warning', 'normal', persistent);
  }, [addNotification]);

  const info = useCallback((title: string, description?: string, persistent = false) => {
    return addNotification(title, description, 'info', 'low', persistent);
  }, [addNotification]);

  const critical = useCallback((title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    return addNotification(title, description, 'error', 'critical', true, action);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getUnreadCount,
    success,
    error,
    warning,
    info,
    critical
  };
}