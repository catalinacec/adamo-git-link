import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initial check for token');
    // Check for existing token on mount
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    console.log('AuthProvider: Found token:', !!token, 'Found userData:', !!userData);
    
    if (token && userData) {
      console.log('AuthProvider: Setting user as authenticated');
      setAccessToken(token);
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    } else {
      console.log('AuthProvider: No valid token/user found');
    }
    
    setIsLoading(false);
    console.log('AuthProvider: Initialization complete');
  }, []);

  const login = async (email: string, password: string) => {
    // Check for hardcoded credentials
    if (email === "catalinacec@gmail.com" && password === "Caticasd12*") {
      const mockToken = "mock_token_" + Date.now();
      const mockUser = {
        name: "Catalina",
        email: "catalinacec@gmail.com",
        id: "1"
      };

      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));
      
      setAccessToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      return;
    }
    
    throw new Error("Credenciales inválidas");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};