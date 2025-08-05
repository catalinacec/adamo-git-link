import React, { createContext, useContext, useState, useEffect } from 'react';
import { dashboardService } from '@/services/api';
import type { DashboardResponse } from '@/types/api';

interface DashboardContextType {
  dashboard: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getDashboardInfo();
      setDashboard(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboard,
        loading,
        error,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};