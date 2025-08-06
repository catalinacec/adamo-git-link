"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  pendingToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  setAcceptedTerms: () => void;
  setUpdatedPassword: () => void;
  logout: () => void;
  refreshTokens: () => Promise<void>;
}

interface JWTPayload {
  exp: number;
  iat?: number;
  [key: string]: any;
}

const ACCESS_TOKEN_KEY = "app_access_token";
const REFRESH_TOKEN_KEY = "app_refresh_token";
const TEMP_TOKEN_KEY = "app_temp_token";
const TEMP_REFRESH_KEY = "app_temp_refresh";
const SESSION_STORAGE_KEY = "app_session";

const INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000;
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingRefreshToken, setPendingRefreshToken] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTermsState] = useState<boolean>(false);
  const [hasUpdatedPassword, setHasUpdatedPasswordState] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleRefresh = useCallback(
    (token: string) => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      let payload: JWTPayload;
      try {
        payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
      } catch (e) {
        console.error("No se pudo decodificar JWT para programar refresh:", e);
        return;
      }
      
      const expiresAtMs = payload.exp * 1000;
      const nowMs = Date.now();
      const msUntilExpiry = expiresAtMs - nowMs;
      const refreshInMs = msUntilExpiry - REFRESH_BUFFER_MS;
      
      if (refreshInMs <= 0) {
        doRefresh();
      } else {
        refreshTimeoutRef.current = setTimeout(() => {
          doRefresh();
        }, refreshInMs);
      }
    },
    []
  );

  const doRefresh = useCallback(async () => {
    if (!refreshToken) {
      console.warn("No hay refreshToken para refrescar");
      logout();
      return;
    }
    
    try {
      // Check for hardcoded user
      const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (storedToken?.includes("catalina")) {
        const newAccess = `access_token_catalina_${Date.now()}`;
        const newRefresh = refreshToken;

        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        setIsAuthenticated(true);

        try {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        } catch (e) {
          console.error("Error guardando tokens en storage tras refresh:", e);
        }

        scheduleRefresh(newAccess);
        return;
      }

      // Mock refresh for other users
      const newAccess = `mock_token_${Date.now()}`;
      const newRefresh = refreshToken;

      setAccessToken(newAccess);
      setRefreshToken(newRefresh);
      setIsAuthenticated(true);

      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
      } catch (e) {
        console.error("Error guardando tokens en storage tras refresh:", e);
      }

      scheduleRefresh(newAccess);
    } catch (e) {
      console.error("Falló refresh token:", e);
      logout();
    }
  }, [refreshToken, scheduleRefresh]);

  const logout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    setAccessToken(null);
    setRefreshToken(null);
    setPendingToken(null);
    setPendingRefreshToken(null);
    setHasAcceptedTermsState(false);
    setHasUpdatedPasswordState(false);
    setIsAuthenticated(false);
    
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(TEMP_TOKEN_KEY);
      sessionStorage.removeItem(TEMP_REFRESH_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error("Error limpiando storage en logout:", e);
    }
    
    navigate("/auth");
  }, [navigate]);

  const refreshTokens = useCallback(async () => {
    await doRefresh();
  }, [doRefresh]);

  const login = useCallback(
    (newAccessToken: string, newRefreshToken: string) => {
      // Check for Catalina's credentials
      if (newAccessToken.includes("catalina")) {
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
        setIsAuthenticated(true);
        setHasAcceptedTermsState(true);
        setHasUpdatedPasswordState(true);

        try {
          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        } catch (e) {
          console.error("Error guardando tokens completos en storage:", e);
        }

        scheduleRefresh(newAccessToken);
        navigate("/");
        return;
      }

      // For other users, use pending flow
      setPendingToken(newAccessToken);
      setPendingRefreshToken(newRefreshToken);
      setHasAcceptedTermsState(false);
      setHasUpdatedPasswordState(false);

      try {
        sessionStorage.setItem(TEMP_TOKEN_KEY, newAccessToken);
        sessionStorage.setItem(TEMP_REFRESH_KEY, newRefreshToken);
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ hasAcceptedTerms: false, hasUpdatedPassword: false })
        );
      } catch (e) {
        console.error("Error guardando pending tokens en sessionStorage:", e);
      }
    },
    [scheduleRefresh, navigate]
  );

  const setAcceptedTerms = () => {
    setHasAcceptedTermsState(true);
  };
  
  const setUpdatedPassword = () => {
    setHasUpdatedPasswordState(true);
  };

  useEffect(() => {
    try {
      const storedPending = sessionStorage.getItem(TEMP_TOKEN_KEY);
      const storedPendingRefresh = sessionStorage.getItem(TEMP_REFRESH_KEY);
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      
      if (storedPending) {
        setPendingToken(storedPending);
        if (storedPendingRefresh) {
          setPendingRefreshToken(storedPendingRefresh);
        }
        if (sessionData) {
          try {
            const { hasAcceptedTerms: terms, hasUpdatedPassword: password } = JSON.parse(sessionData);
            setHasAcceptedTermsState(terms || false);
            setHasUpdatedPasswordState(password || false);
          } catch (error) {
            console.error("Error parseando session data:", error);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } else {
        const storedAccess = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (storedAccess && storedRefresh) {
          setAccessToken(storedAccess);
          setRefreshToken(storedRefresh);
          setIsAuthenticated(true);
          scheduleRefresh(storedAccess);
        }
      }
    } catch (e) {
      console.error("Error leyendo storage en init:", e);
    } finally {
      setIsInitialized(true);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    if (
      pendingToken &&
      pendingRefreshToken &&
      hasAcceptedTerms &&
      hasUpdatedPassword &&
      isInitialized &&
      !isAuthenticated
    ) {
      setAccessToken(pendingToken);
      setRefreshToken(pendingRefreshToken);
      setIsAuthenticated(true);

      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, pendingToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, pendingRefreshToken);
      } catch (e) {
        console.error("Error guardando tokens completos en storage:", e);
      }

      try {
        sessionStorage.removeItem(TEMP_TOKEN_KEY);
        sessionStorage.removeItem(TEMP_REFRESH_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (e) {
        console.error("Error limpiando pending sessionStorage:", e);
      }

      scheduleRefresh(pendingToken);
      navigate("/");
    }
  }, [pendingToken, pendingRefreshToken, hasAcceptedTerms, hasUpdatedPassword, isInitialized, isAuthenticated, scheduleRefresh, navigate]);

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        pendingToken,
        login,
        setAcceptedTerms,
        setUpdatedPassword,
        logout,
        refreshTokens,
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