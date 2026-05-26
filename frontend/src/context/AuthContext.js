import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const normalizeRole = (role) => (role || 'member').toString().trim().toLowerCase();

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    normalizeUser(JSON.parse(localStorage.getItem('user')))
  );

  const login = (userData, token) => {
    const normalizedUser = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);