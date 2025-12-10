import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Role = 'admin' | 'talent' | 'artist';

/**
 * Custom hook for route protection with role-based access
 * Reduces duplication in protected pages
 */
export function useProtectedRoute(options?: {
  requiredRole?: Role;
  redirectTo?: string;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { requiredRole, redirectTo = '/login' } = options || {};

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      } else if (requiredRole && profile?.role !== requiredRole) {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, requiredRole, redirectTo, router]);

  return { user, profile, loading, isAuthorized: !!user && (!requiredRole || profile?.role === requiredRole) };
}
