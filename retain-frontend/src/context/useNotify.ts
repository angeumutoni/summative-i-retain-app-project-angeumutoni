import { useContext } from 'react';
import { NotificationContext } from './NotificationContext';
import type { NotificationContextValue } from './NotificationContext';

export function useNotify(): NotificationContextValue['notify'] {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotify must be used within a NotificationProvider');
  }
  return context.notify;
}