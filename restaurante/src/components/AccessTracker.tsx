import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccessLog } from '@/contexts/AccessLogContext';

export function AccessTracker({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { addLog } = useAccessLog();
  const previousAuthRef = React.useRef<boolean>(false);
  const previousUserRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // User just logged in
      if (!previousAuthRef.current) {
        addLog({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: 'login',
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      }
      previousAuthRef.current = true;
      previousUserRef.current = user.id;
    } else {
      // User just logged out
      if (previousAuthRef.current && previousUserRef.current) {
        addLog({
          userId: previousUserRef.current,
          userName: 'Usuário Desconectado',
          userEmail: 'N/A',
          userRole: 'client',
          action: 'logout',
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      }
      previousAuthRef.current = false;
      previousUserRef.current = null;
    }
  }, [isAuthenticated, user, addLog]);

  // Track page visits
  useEffect(() => {
    if (isAuthenticated && user) {
      // Log page visit
      const currentPath = window.location.pathname;
      const isAdminAccess = currentPath === '/admin';

      addLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: isAdminAccess ? 'admin_access' : 'page_visit',
        page: currentPath,
        userAgent: navigator.userAgent,
      });
    }
  }, [window.location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
