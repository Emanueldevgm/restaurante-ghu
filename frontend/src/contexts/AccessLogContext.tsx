import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AccessLog, User } from '@/types/restaurant';

interface AccessLogContextType {
  logs: AccessLog[];
  addLog: (log: Omit<AccessLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  getLogs: () => AccessLog[];
  getLogsByUser: (userId: string) => AccessLog[];
  getLogsByAction: (action: string) => AccessLog[];
  getRecentLogs: (hours: number) => AccessLog[];
}

const AccessLogContext = createContext<AccessLogContextType | undefined>(undefined);

export function AccessLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AccessLog[]>([]);

  // Load logs from localStorage on mount
  useEffect(() => {
    const storedLogs = localStorage.getItem('restaurant_access_logs');
    if (storedLogs) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setLogs(parsedLogs);
      } catch (error) {
        console.error('Error loading access logs:', error);
      }
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('restaurant_access_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (logData: Omit<AccessLog, 'id' | 'timestamp'>) => {
    const newLog: AccessLog = {
      ...logData,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setLogs(prev => [newLog, ...prev]); // Add to beginning for most recent first
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('restaurant_access_logs');
  };

  const getLogs = () => [...logs];

  const getLogsByUser = (userId: string) => {
    return logs.filter(log => log.userId === userId);
  };

  const getLogsByAction = (action: string) => {
    return logs.filter(log => log.action === action);
  };

  const getRecentLogs = (hours: number) => {
    const now = new Date();
    const timeLimit = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return logs.filter(log => new Date(log.timestamp) > timeLimit);
  };

  return (
    <AccessLogContext.Provider
      value={{
        logs,
        addLog,
        clearLogs,
        getLogs,
        getLogsByUser,
        getLogsByAction,
        getRecentLogs,
      }}
    >
      {children}
    </AccessLogContext.Provider>
  );
}

export function useAccessLog() {
  const context = useContext(AccessLogContext);
  if (context === undefined) {
    throw new Error('useAccessLog must be used within an AccessLogProvider');
  }
  return context;
}
