import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import DatabaseService from '../services/DatabaseService';
import CryptoService from '../services/CryptoService';

interface DatabaseContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  databaseService: typeof DatabaseService;
  cryptoService: CryptoService;
  initializeServices: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cryptoService] = useState(() => new CryptoService());

  const initializeServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 初始化加密服务
      await cryptoService.initialize();
      
      // 初始化数据库服务
      await DatabaseService.initialize();
      
      setIsInitialized(true);
      console.log('Database and Crypto services initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize services';
      setError(errorMessage);
      console.error('Failed to initialize services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeServices();
  }, []);

  const value: DatabaseContextType = {
    isInitialized,
    isLoading,
    error,
    databaseService: DatabaseService,
    cryptoService,
    initializeServices
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
