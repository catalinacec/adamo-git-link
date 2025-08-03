"use client";

import React, { createContext, useContext, useState } from "react";

interface FileContextType {
  file: File | string | null;
  setFile: (file: File | string | null) => void;
  fileName: string | null;
  setFileName: (fileName: string | null) => void;
  resetFile: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: React.ReactNode }) => {
  const [file, setFile] = useState<File | string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetFile = () => {
    setFile(null);
    setFileName(null);
  };

  return (
    <FileContext.Provider
      value={{ file, setFile, fileName, setFileName, resetFile }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};
