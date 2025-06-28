import React, { createContext, useContext } from "react";

type ApiContextType = {
  baseURL: string;
};

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ 
  children, 
  baseURL 
}: { 
  children: React.ReactNode; 
  baseURL: string; 
}) {
  return (
    <ApiContext.Provider value={{ baseURL }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
} 