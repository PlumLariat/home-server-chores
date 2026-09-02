import { createContext, useContext, useState, type ReactNode } from "react";

const STORAGE_KEY = "chore-tracker.current-person-id";

interface PersonContextValue {
  currentPersonId: number | null;
  setCurrentPersonId: (id: number | null) => void;
}

const PersonContext = createContext<PersonContextValue | undefined>(undefined);

export function PersonProvider({ children }: { children: ReactNode }) {
  const [currentPersonId, setCurrentPersonIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  const setCurrentPersonId = (id: number | null) => {
    setCurrentPersonIdState(id);
    if (id === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, String(id));
    }
  };

  return (
    <PersonContext.Provider value={{ currentPersonId, setCurrentPersonId }}>
      {children}
    </PersonContext.Provider>
  );
}

export function usePersonContext(): PersonContextValue {
  const ctx = useContext(PersonContext);
  if (!ctx) throw new Error("usePersonContext must be used within a PersonProvider");
  return ctx;
}
