"use client";

import React, { createContext, useContext, useRef, useState } from "react";

interface Signature {
  id: string;
  left: number;
  top: number;
  slideIndex: number;
  signatureText: string;
  recipientsName: string;
  recipientEmail: string;
  signatureContentFixed: boolean;
  signatureIsEdit: boolean;
}

interface Participent {
  firstName: string;
  lastName: string;
  email: string;
  color: string;
}

interface SignatureContextType {
  signatures: Signature[];
  setSignatures: (signatures: Signature[]) => void;
  participants: Participent[];
  setParticipants: (participants: Participent[]) => void;
  isEditingSignature: boolean;
  setIsEditingSignature: (isEditing: boolean) => void;
  activeSignature: Signature | null;
  setActiveSignature: (signature: Signature | null) => void;
  typedSignature: string | null;
  setTypedSignature: (typed: string | null) => void;
  currentSlideIndex: number;
  setCurrentSlideIndex: (index: number) => void;
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
  viewerRef: React.RefObject<any>;
  setViewerRef: (ref: React.RefObject<any>) => void;
  activeRecipient: any[];
  setActiveRecipient: (recipient: any[]) => void;
  disableButton: boolean;
  setDisableButton: (disabled: boolean) => void;
  loading: boolean;
  setLoading: (disabled: boolean) => void;
  adminCheck: boolean;
  setAdminCheck: (disabled: boolean) => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(
  undefined,
);

export const SignatureProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [participants, setParticipants] = useState<Participent[]>([]);
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [activeSignature, setActiveSignature] = useState<Signature | null>(
    null,
  );
  const [typedSignature, setTypedSignature] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pdfLoad, setPdfLoad] = useState(false);
  const [activeRecipientEmail, setActiveRecipientEmail] = useState("");
  const [queryPdfUrl, setQueryPdfUrl] = useState<string | null>(null);
  const [pdfLink, setPdfLink] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [uniqueToken, setUniqueToken] = useState<string | null>(null);
  const [tokenOfQuery, setTokenOfQuery] = useState("");
  const [activeUserOfQuery, setActiveUserOfQuery] = useState("");
  const [activeRecipient, setActiveRecipient] = useState<any[]>([]);
  const [disableButton, setDisableButton] = useState(true);
  const [loading, setLoading] = useState(true);
  const [adminCheck, setAdminCheck] = useState(false);

  const viewerRef = useRef<any>(null);

  const setViewerRef = (ref: React.RefObject<any>) => {
    viewerRef.current = ref.current;
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
        uniqueToken,
        setUniqueToken,
        documentName,
        setDocumentName,
        tokenOfQuery,
        setTokenOfQuery,
        activeUserOfQuery,
        setActiveUserOfQuery,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignatureData = () => {
  const context = useContext(SignatureContext);
  if (!context) {
    throw new Error("useSignatureData must be used within a SignatureProvider");
  }
  return context;
};
