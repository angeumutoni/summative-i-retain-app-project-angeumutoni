import { createContext } from 'react';

export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

export interface NotificationContextValue {
  notify: (message: string, severity?: NotificationSeverity) => void;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);