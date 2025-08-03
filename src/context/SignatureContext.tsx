import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Signature, DocumentStats } from '@/types';
import { documentService } from '@/services/documentService';

interface SignatureContextType {
  signatures: Signature[];
  setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
  activeSignature: Signature | null;
  setActiveSignature: (signature: Signature | null) => void;
  documentStats: DocumentStats | null;
  refreshStats: () => Promise<void>;
  isLoading: boolean;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

interface SignatureProviderProps {
  children: ReactNode;
}

export function SignatureProvider({ children }: SignatureProviderProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [activeSignature, setActiveSignature] = useState<Signature | null>(null);
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      const stats = await documentService.getStats();
      setDocumentStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <SignatureContext.Provider
      value={{
        signatures,
        setSignatures,
        activeSignature,
        setActiveSignature,
        documentStats,
        refreshStats,
        isLoading,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
}

export function useSignatureData() {
  const context = useContext(SignatureContext);
  if (context === undefined) {
    throw new Error('useSignatureData must be used within a SignatureProvider');
  }
  return context;
}