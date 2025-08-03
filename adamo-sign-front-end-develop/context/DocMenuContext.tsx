import React, { createContext, useContext, useState } from "react";

// Define the context interface
interface DocMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

// Create the context with a default value of null
const DocMenuContext = createContext<DocMenuContextType | null>(null);

// Custom hook to consume the context
export const useDocMenu = () => {
  const context = useContext(DocMenuContext);
  if (!context) {
    throw new Error("useDocMenu must be used within a DocMenuProvider");
  }
  return context;
};

// Provider component to wrap your application or part of it
export const DocMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DocMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DocMenuContext.Provider>
  );
};
