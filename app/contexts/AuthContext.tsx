import { createContext, useContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

type AuthContextType = {
  /** Whether the server had valid auth credentials on initial render */
  serverWasAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
  serverWasAuthenticated,
}: {
  children: React.ReactNode;
  serverWasAuthenticated: boolean;
}) {
  return (
    <AuthContext.Provider value={{ serverWasAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Returns whether the user is authenticated (server or client).
 * Use this instead of useAuth0().isAuthenticated when you need
 * to show authenticated UI immediately on server-authenticated pages.
 */
export function useIsAuthenticated(): boolean {
  const context = useContext(AuthContext);
  const { isLoading, isAuthenticated } = useAuth0();

  if (context === undefined) {
    throw new Error("useIsAuthenticated must be used within an AuthProvider");
  }

  return (context.serverWasAuthenticated && isLoading) || isAuthenticated;
}
