'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/auth/auth-provider';
import { signIn as signInAction, signOut as signOutAction, signUp as signUpAction, signInWithOAuth as signInWithOAuthAction } from '@/app/auth/actions';

export function useAuth() {
  const router = useRouter();
  const { user, session, loading } = useAuthContext();

  const signUp = useCallback(
    async (email: string, password: string) => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const result = await signUpAction(formData);
      if (result?.error) throw new Error(result.error);
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const result = await signInAction(formData);
      if (result?.error) throw new Error(result.error);
    },
    []
  );

  const signOut = useCallback(async () => {
    await signOutAction();
  }, []);

  const signInWithOAuth = useCallback(
    async (provider: 'github' | 'google') => {
      const result = await signInWithOAuthAction(provider);
      if (result?.error) throw new Error(result.error);
    },
    []
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
