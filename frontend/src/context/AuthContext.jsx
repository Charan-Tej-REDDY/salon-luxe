import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
          // Refresh user data from /api/auth/me
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error("Session expired or invalid token:", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: jwtToken, id, name, email: userEmail, role } = response.data;

    const userData = { id, name, email: userEmail, role };
    setToken(jwtToken);
    setUser(userData);

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const register = async (name, email, password, role = 'CUSTOMER') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    const { token: jwtToken, id, name: userName, email: userEmail, role: userRole } = response.data;

    const userData = { id, name: userName, email: userEmail, role: userRole };
    setToken(jwtToken);
    setUser(userData);

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
