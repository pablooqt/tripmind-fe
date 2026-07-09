import React, { createContext, useContext, useState } from 'react';
import CustomAlertModal from '@/components/common/CustomAlertModal';

interface AlertContextType {
  showAlert: (
    title: string,
    message: string,
    type?: 'success' | 'error' | 'info' | 'confirm',
    onConfirm?: () => void,
    options?: { confirmText?: string; cancelText?: string }
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info' | 'confirm'>('info');
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | undefined>(undefined);
  const [options, setOptions] = useState<{ confirmText?: string; cancelText?: string }>({});

  const showAlert = (
    alertTitle: string,
    alertMessage: string,
    alertType: 'success' | 'error' | 'info' | 'confirm' = 'info',
    onConfirm?: () => void,
    alertOptions?: { confirmText?: string; cancelText?: string }
  ) => {
    setTitle(alertTitle);
    setMessage(alertMessage);
    setType(alertType);
    setOnConfirmCallback(() => () => {
      setVisible(false);
      if (onConfirm) onConfirm();
    });
    setOptions(alertOptions || {});
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlertModal
        visible={visible}
        title={title}
        message={message}
        type={type}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onClose={hideAlert}
        onConfirm={onConfirmCallback}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
