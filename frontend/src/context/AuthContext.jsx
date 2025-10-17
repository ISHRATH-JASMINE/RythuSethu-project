import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Backend returns { success, user, token }
    const userData = { ...data.user, token: data.token };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    // Backend returns { success, message, user, token }
    const userDataWithToken = { ...data.user, token: data.token };
    localStorage.setItem('user', JSON.stringify(userDataWithToken));
    setUser(userDataWithToken);
    return userDataWithToken;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home page
    window.location.href = '/';
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    const updatedUser = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  // Role checking utilities
  const isFarmer = () => user?.role === 'farmer';
  const isDealer = () => user?.role === 'dealer';
  const isAdmin = () => user?.role === 'admin';
  const isDealerApproved = () => user?.role === 'dealer' && user?.dealerInfo?.approved === true;
  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    // Role utilities
    isFarmer,
    isDealer,
    isAdmin,
    isDealerApproved,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
