import { useCallback, useMemo, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import { Alert, Snackbar } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import { NotificationContext } from './NotificationContext';
import type { NotificationContextValue, NotificationSeverity } from './NotificationContext';

interface Notification {
  id: number;
  message: string;
  severity: NotificationSeverity;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const notify = useCallback((message: string, severity: NotificationSeverity = 'success') => {
    setNotification({ id: Date.now(), message, severity });
    setOpen(true);
  }, []);

  const handleClose = (_event: Event | SyntheticEvent | null, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const value = useMemo<NotificationContextValue>(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <Snackbar
          key={notification.id}
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}