import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Signature } from '@/types';

interface Participant {
  firstName: string;
  lastName: string;
  listContact: boolean;
  email: string;
  uuid?: string;
  color?: string;
  signatures?: Signature[];
}

interface AdminData {
  id: number;
  title: string;
  date: string;
  adminCheck: string;
  participants: {
    id: number;
    photo: string;
    firstName: string;
    lastName: string;
    email: string;
    docUrl: string | undefined;
    status: {
      id: string;
      timestamp: string;
      helperText: string;
    };
    color?: string;
  }[];
  status: string;
  register: string;
  token: string;
}

interface TokenData {
  signatureId: string;
  participantEmail: string;
  participantId?: string | number;
  token: string;
  url: string;
}

interface SignatureContextType {
  signatures: Signature[];
  setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  isEditingSignature: boolean;
  setIsEditingSignature: (isEditing: boolean) => void;
  activeSignature: Signature | null;
  setActiveSignature: (signature: Signature | null) => void;
  typedSignature: string | null;
  setTypedSignature: (typed: string | null) => void;
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
  currentStep: number;
  setCurrentStep: (index: number) => void;
  pdfLoad: boolean;
  setPdfLoad: (load: boolean) => void;
  activeRecipientEmail: string;
  setActiveRecipientEmail: (email: string) => void;
  queryPdfUrl: string | null;
  setQueryPdfUrl: (url: string | null) => void;
  pdfLink: string | null;
  setPdfLink: (link: string | null) => void;
  documentName: string | null;
  setDocumentName: (link: string | null) => void;
  uniqueToken: string | null;
  setUniqueToken: (link: string | null) => void;
  tokenOfQuery: string;
  setTokenOfQuery: (token: string) => void;
  activeUserOfQuery: string;
  setActiveUserOfQuery: (user: string) => void;
  sendFileType: string | null;
  setSendFileType: (user: string | null) => void;
  setAdminData: (adminData: AdminData[]) => void;
  adminData: AdminData[];
  viewerRef: React.RefObject<any>;
  setViewerRef: (ref: React.RefObject<any>) => void;
  activeRecipient: Participant[];
  setActiveRecipient: (recipient: Participant[]) => void;
  disableButton: boolean;
  setDisableButton: (disabled: boolean) => void;
  loading: boolean;
  setLoading: (disabled: boolean) => void;
  adminCheck: boolean;
  setAdminCheck: (disabled: boolean) => void;
  downloadCheck: boolean;
  setDownLoadCheck: (disabled: boolean) => void;
  tokens: TokenData[];
  setTokens: (tokens: TokenData[]) => void;
  resetContext: () => void;
  documentId: string | null;
  setDocumentId: (id: string | null) => void;
  uuid: string;
  setUuid: (uuid: string) => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

interface SignatureProviderProps {
  children: ReactNode;
}

export function SignatureProvider({ children }: SignatureProviderProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [activeSignature, setActiveSignature] = useState<Signature | null>(null);
  const [typedSignature, setTypedSignature] = useState<string | null>(null);
  const [sendFileType, setSendFileType] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [activeRecipientEmail, setActiveRecipientEmail] = useState("");
  const [queryPdfUrl, setQueryPdfUrl] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [uniqueToken, setUniqueToken] = useState<string | null>(null);
  const [tokenOfQuery, setTokenOfQuery] = useState("");
  const [activeUserOfQuery, setActiveUserOfQuery] = useState("");
  const [activeRecipient, setActiveRecipient] = useState<Participant[]>([]);
  const [disableButton, setDisableButton] = useState(true);
  const [loading, setLoading] = useState(false);
  const [adminCheck, setAdminCheck] = useState(false);
  const [downloadCheck, setDownLoadCheck] = useState(false);
  const [adminData, setAdminData] = useState<AdminData[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string>("");
  
  const viewerRef = useRef<any>(null);

  const setViewerRef = (ref: React.RefObject<any>) => {
    viewerRef.current = ref.current;
  };

  const resetContext = () => {
    setSignatures([]);
    setParticipants([]);
    setIsEditingSignature(false);
    setActiveSignature(null);
    setTypedSignature(null);
    setSendFileType(null);
    setCurrentSlideIndex(0);
    setCurrentStep(1);
    setPdfLoad(false);
    setActiveRecipientEmail("");
    setQueryPdfUrl(null);
    setPdfLink(null);
    setDocumentName(null);
    setUniqueToken(null);
    setTokenOfQuery("");
    setActiveUserOfQuery("");
    setActiveRecipient([]);
    setDisableButton(true);
    setLoading(false);
    setAdminCheck(false);
    setDownLoadCheck(false);
    setAdminData([]);
    setTokens([]);
    viewerRef.current = null;
  };

  return (
    <SignatureContext.Provider
      value={{
        signatures,
        setSignatures,
        participants,
        setParticipants,
        isEditingSignature,
        setIsEditingSignature,
        activeSignature,
        setActiveSignature,
        typedSignature,
        setTypedSignature,
        currentSlideIndex,
        setCurrentSlideIndex,
        currentStep,
        setCurrentStep,
        pdfLoad,
        setPdfLoad,
        activeRecipientEmail,
        setActiveRecipientEmail,
        queryPdfUrl,
        setQueryPdfUrl,
        pdfLink,
        setPdfLink,
        viewerRef,
        setViewerRef,
        activeRecipient,
        setActiveRecipient,
        disableButton,
        setDisableButton,
        loading,
        setLoading,
        adminCheck,
        setAdminCheck,
        downloadCheck,
        setDownLoadCheck,
        uniqueToken,
        setUniqueToken,
        documentName,
        setDocumentName,
        tokenOfQuery,
        setTokenOfQuery,
        activeUserOfQuery,
        setActiveUserOfQuery,
        adminData,
        setAdminData,
        sendFileType,
        setSendFileType,
        tokens,
        setTokens,
        resetContext,
        documentId,
        setDocumentId,
        uuid,
        setUuid
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