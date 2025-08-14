import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types'; // Assuming User type is defined
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

// NOTE: This is a basic prototype authentication.
// DO NOT use localStorage for sensitive data like passwords in production.
// Use secure methods like hashing passwords server-side and JWTs.

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<boolean>; // pass for prototype only
  register: (username: string, pass: string) => Promise<boolean>; // pass for prototype only
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged-in user in localStorage on initial load
    try {
      const storedUser = localStorage.getItem('big_currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem('big_currentUser');
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Failsafe login
    if (username.toLowerCase() === 'admin' && pass === 'admin') {
      const adminUser: User = { id: 'admin_user_id', username: 'admin' };
      localStorage.setItem('big_currentUser', JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      setLoading(false);
      return true;
    }

    // Simulate API call / password check for regular users
    try {
      const storedUsersRaw = localStorage.getItem('big_users');
      const storedUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      const foundUser = storedUsers.find(u => u.username.toLowerCase() === username.toLowerCase());

      // Simulate password check (highly insecure, for prototype only)
      const storedUserPass = localStorage.getItem(`big_user_pass_${username.toLowerCase()}`);

      if (foundUser && storedUserPass === pass) {
        const sessionUser: User = { id: foundUser.id, username: foundUser.username };
        localStorage.setItem('big_currentUser', JSON.stringify(sessionUser));
        setCurrentUser(sessionUser);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
    setLoading(false);
    return false;
  }, []);

  const register = useCallback(async (username: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Prevent admin username registration
    if (username.toLowerCase() === 'admin') {
        setLoading(false);
        return false; 
    }
    try {
      const storedUsersRaw = localStorage.getItem('big_users');
      const storedUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      
      if (storedUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        setLoading(false);
        return false; // User already exists
      }
      
      const newUser: User = { id: uuidv4(), username: username }; // Store username as provided (case-sensitive for display, but compare lowercase)
      storedUsers.push(newUser);
      localStorage.setItem('big_users', JSON.stringify(storedUsers));
      // Store plain password for prototype login check - EXTREMELY INSECURE
      localStorage.setItem(`big_user_pass_${username.toLowerCase()}`, pass);

      // Automatically log in the new user
      const sessionUser: User = { id: newUser.id, username: newUser.username };
      localStorage.setItem('big_currentUser', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('big_currentUser');
    sessionStorage.removeItem('brandingSplashShown'); // Clear session splash state on logout
    setCurrentUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};