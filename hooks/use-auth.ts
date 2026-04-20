import { useAuth } from '@/src/providers/AuthProvider';

export function useAuthSession() {
  return useAuth();
}
