"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  UserResponse,
  CompanyWithSpecialtiesResponse,
  TokenResponse,
  UserRole,
} from "@/types";
import api, { setTokens, clearTokens, getAccessToken } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  company: CompanyWithSpecialtiesResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserResponse>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [company, setCompany] = useState<CompanyWithSpecialtiesResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const refreshUser = useCallback(async () => {
    const response = await api.get<UserResponse>("/auth/me");
    setUser(response.data);
  }, []);

  const refreshCompany = useCallback(async () => {
    try {
      const response = await api.get<CompanyWithSpecialtiesResponse>(
        "/companies/me"
      );
      setCompany(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCompany(null);
      } else {
        throw error;
      }
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<UserResponse> => {
      const response = await api.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      setTokens(response.data.access_token, response.data.refresh_token);
      const userRes = await api.get<UserResponse>("/auth/me");
      setUser(userRes.data);
      await refreshCompany();
      return userRes.data;
    },
    [refreshCompany]
  );

  const register = useCallback(
    async (email: string, password: string, role: UserRole) => {
      await api.post("/auth/register", { email, password, role });
      await login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setCompany(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    const init = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          await refreshUser();
          await refreshCompany();
        } catch {
          clearTokens();
          setUser(null);
          setCompany(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, [refreshUser, refreshCompany]);

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        refreshCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
