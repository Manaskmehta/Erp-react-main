import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, LoginRequest, LoginResponse } from '@/services/api';
import { TOKEN_STORAGE } from '@/config/api';

interface User {
  id: number;
  email: string;
  name: string;
  phone_no: string;
  gstno: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = () => {
      try {
        // Check if token exists and is not expired
        const token = localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
        
        if (!token || apiService.isTokenExpired()) {
          // No token or token is expired, clear local storage
          localStorage.removeItem(TOKEN_STORAGE.ACCESS_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE.USER_DATA);
          setUser(null);
        } else {
          // Token is valid, get stored user data
          const storedUser = apiService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear everything on error
        localStorage.removeItem(TOKEN_STORAGE.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_STORAGE.USER_DATA);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up token expiration check interval
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem(TOKEN_STORAGE.ACCESS_TOKEN);
      if (token && apiService.isTokenExpired()) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const credentials: LoginRequest = { email, password };
      const response = await apiService.login(credentials);
      
      if (response.success) {
        // The API response has admin and token at the root level, not in data
        const { admin, token } = response as unknown as LoginResponse;
        
        // Save token and user data
        apiService.saveTokens(token, admin);
        setUser(admin);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};