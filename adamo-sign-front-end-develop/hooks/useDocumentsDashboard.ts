import { useState, useEffect } from "react";
import { DocumentsDashboard } from "@/api/types/DashboardTypes";
import DashboardUseCase from "@/api/useCases/DashboardUseCase";

interface UseDocumentsDashboardResult {
  documents: DocumentsDashboard | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useDocumentsDashboard(): UseDocumentsDashboardResult {
  const [documents, setDocuments] = useState<DocumentsDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DashboardUseCase.getDashboardInfo();
      setDocuments(response.data?.documents ?? null);
    } catch (err: any) {
      setError(err);
      setDocuments(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { documents, loading, error, refresh: fetchDashboard };
}
