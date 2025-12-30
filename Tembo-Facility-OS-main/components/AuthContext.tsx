import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

// Mock Users
export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Sarah Client', 
    role: UserRole.CLIENT, 
    email: 'sarah@acme.com', 
    relatedCustomerId: 'c1' 
  },
  { 
    id: 'u2', 
    name: 'Mike Admin', 
    role: UserRole.ADMIN, 
    email: 'mike@tembo.io' 
  },
  { 
    id: 'u3', 
    name: 'John Tech', 
    role: UserRole.TECHNICIAN, 
    email: 'john@tembo.io', 
    relatedTechnicianId: 't1' 
  },
  { 
    id: 'u4', 
    name: 'Amanda Boss', 
    role: UserRole.SUPER_ADMIN, 
    email: 'amanda@tembo.io' 
  },
];

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const mockUser = MOCK_USERS.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
