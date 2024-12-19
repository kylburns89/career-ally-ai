'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../components/auth/auth-provider';
import { 
  signIn as signInAction, 
  signOut as signOutAction, 
  signUp as signUpAction, 
  signInWithOAuth as signInWithOAuthAction,
  type AuthResult 
} from '../app/auth/actions';

export function useAuth() {
  const router = useRouter();
  const { user, session, loading } = useAuthContext();

  const handleAuthResult = useCallback((result: AuthResult) => {
    if ('error' in result) {
      throw new Error(result.error);
    }
    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  }, [router]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const result = await signUpAction(formData);
      handleAuthResult(result);
    },
    [handleAuthResult]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const result = await signInAction(formData);
      handleAuthResult(result);
    },
    [handleAuthResult]
  );

  const signOut = useCallback(async () => {
    const result = await signOutAction();
    handleAuthResult(result);
  }, [handleAuthResult]);

  const signInWithOAuth = useCallback(
    async (provider: 'github' | 'google') => {
      const result = await signInWithOAuthAction(provider);
      handleAuthResult(result);
    },
    [handleAuthResult]
  );

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
  };
}
