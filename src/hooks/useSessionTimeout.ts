import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { logger } from '../utils/logger';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onWarning?: () => void;
  onTimeout?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 5,
  warningMinutes = 1,
  onWarning,
  onTimeout
}: UseSessionTimeoutOptions = {}) => {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    lastActivityRef.current = Date.now();

    // Set warning timer (1 minute before timeout)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      logger.info('Session warning triggered');
      if (onWarning) {
        onWarning();
      } else {
        // Default warning behavior
        const remainingTime = warningMinutes;
        const shouldContinue = window.confirm(
          `⚠️ Session d'inactivité\n\nVotre session expirera dans ${remainingTime} minute(s) par mesure de sécurité.\n\nCliquez "OK" pour rester connecté(e)\nCliquez "Annuler" pour vous déconnecter maintenant`
        );
        
        if (shouldContinue) {
          // Reset timer if user wants to continue
          resetTimer();
          logger.info('Session extended by user');
        } else {
          // Logout immediately if user chooses to
          handleTimeout();
        }
      }
    }, warningTime);

    // Set timeout timer
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeoutTime);

    logger.debug(`Session timer reset - timeout in ${timeoutMinutes} minutes`);
  }, [isAuthenticated, timeoutMinutes, warningMinutes, onWarning]);

  const handleTimeout = useCallback(() => {
    logger.info('Session timeout triggered');
    
    if (onTimeout) {
      onTimeout();
    } else {
      // Default timeout behavior
      alert('🔒 Session expirée\n\nVotre session a expiré après 5 minutes d\'inactivité pour des raisons de sécurité.\n\nVeuillez vous reconnecter.');
      logout();
    }
  }, [logout, onTimeout]);

  const trackActivity = useCallback(() => {
    if (!isAuthenticated) return;
    
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;
    
    // Only reset if there's been significant time since last activity (prevent excessive resets)
    // Increase threshold to prevent notification clicks and confirmations from resetting timer
    if (timeSinceLastActivity > 60000) { // 60 seconds threshold to avoid confirmation resets
      resetTimer();
    }
  }, [resetTimer, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear timers when not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      return;
    }

    // Start the timer when authenticated
    resetTimer();

    // Activity event listeners - exclude some events that shouldn't reset session
    const events = [
      'mousemove',
      'keypress',
      'scroll',
      'touchstart'
    ];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // Add specific click handler that ignores notification area clicks
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      // Don't reset timer for clicks on notification dropdown, header elements, or modal confirmations
      if (target.closest('.notification-dropdown') || 
          target.closest('.session-info-dropdown') ||
          target.closest('header') ||
          target.closest('.modal') ||
          target.closest('.fixed.inset-0') ||
          target.closest('[role="dialog"]') ||
          target.closest('.swal2-container')) { // Sweet Alert modals if used
        return;
      }
      trackActivity();
    };

    document.addEventListener('click', handleClick, true);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      
      document.removeEventListener('click', handleClick, true);
    };
  }, [isAuthenticated, resetTimer, trackActivity]);

  // Return utility functions
  return {
    resetTimer,
    getRemainingTime: () => {
      if (!isAuthenticated) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
      return Math.max(0, Math.floor(remaining / 1000));
    },
    isActive: () => isAuthenticated && timeoutRef.current !== null
  };
};