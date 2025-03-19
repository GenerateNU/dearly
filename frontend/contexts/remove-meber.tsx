import React, { createContext, useState, ReactNode, useContext } from "react";

export interface MemberToBeRemoved {
  username: string;
  id: string;
}

interface RemoveMemberContextType {
  user: MemberToBeRemoved | null;
  setUser: (updatedUser: MemberToBeRemoved | null) => void;
}

export const RemoveMemberContext = createContext<RemoveMemberContextType>({
  user: null,
  setUser: () => {},
});

interface RemoveMemberProviderProps {
  children: ReactNode;
}

export const RemoveMemberProvider: React.FC<RemoveMemberProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MemberToBeRemoved | null>(null);

  return (
    <RemoveMemberContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </RemoveMemberContext.Provider>
  );
};

export const useRemoveMember = () => {
  const context = useContext(RemoveMemberContext);

  if (!context) {
    throw new Error("useRemoveMember must be used within a RemoveMemberProvider");
  }

  return context;
};
