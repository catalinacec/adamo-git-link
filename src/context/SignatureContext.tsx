import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Signature } from '@/types';

interface SignatureContextType {
  signatures: Signature[];
  setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
  activeSignature: Signature | null;
  setActiveSignature: (signature: Signature | null) => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

interface SignatureProviderProps {
  children: ReactNode;
}

export function SignatureProvider({ children }: SignatureProviderProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [activeSignature, setActiveSignature] = useState<Signature | null>(null);

  return (
    <SignatureContext.Provider
      value={{
        signatures,
        setSignatures,
        activeSignature,
        setActiveSignature,
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