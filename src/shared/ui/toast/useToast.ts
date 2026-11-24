import { use } from 'react';
import { ToastContext } from './toastContext';

export function useToast() {
  return use(ToastContext);
}

/**
 * For controls whose screen is designed but whose functionality is not built yet.
 * Search for this hook to find everything left to connect.
 */
export function usePreviewAction() {
  const toast = useToast();
  return (action: string) => toast(`${action}: not connected yet.`);
}
