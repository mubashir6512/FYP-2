import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

type AppRole = "customer" | "dealer" | "painter" | "admin";

interface User {
  id: string;
  email: string;
  role: AppRole;
  profile?: Profile;
}

interface Profile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  phone: string | null;
  bio?: string | null;
  experience?: number | null;
  specialization?: string | null;
  hourlyRate?: number | string | null;
  skills?: string[] | null;
  availability?: string | null;
  businessName?: string | null;
  address?: string | null;
  city?: string | null;
  notifications?: any | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api('/auth/me');
        setUser(data);
        setProfile(data.profile);
        setRole(data.role);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error("Auth initialization error", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, role }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setProfile(data.user.profile);
      setRole(data.user.role);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setProfile(data.user.profile);
      setRole(data.user.role);

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await api('/auth/me');
      setUser(data);
      setProfile(data.profile);
      setRole(data.role);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error("Failed to refresh profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
