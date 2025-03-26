import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface DropdownContextType {
  openDropdownId: string | null;
  openDropdown: (id: string) => void;
  closeDropdown: (id?: string) => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const useDropdownContext = (): DropdownContextType => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used within a DropdownProvider");
  }
  return context;
};

export const DropdownProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const openDropdown = useCallback((id: string) => {
    setOpenDropdownId(id);
  }, []);

  const closeDropdown = useCallback((id?: string) => {
    setOpenDropdownId((prevId) => (id ? (prevId === id ? null : prevId) : null));
  }, []);

  return (
    <DropdownContext.Provider value={{ openDropdownId, openDropdown, closeDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
};
