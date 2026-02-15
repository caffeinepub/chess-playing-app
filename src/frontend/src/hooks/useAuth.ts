import { useInternetIdentity } from './useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useAuth() {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleLogout = useCallback(async () => {
    await clear();
    queryClient.clear();
  }, [clear, queryClient]);

  return {
    identity,
    isAuthenticated,
    isInitializing,
    login,
    logout: handleLogout,
    loginStatus,
  };
}
