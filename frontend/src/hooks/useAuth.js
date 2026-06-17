import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { login: contextLogin, logout: contextLogout, updateUser, ...authState } = context;

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = response.data;
    contextLogin(user, token);
    return user;
  };

  const register = async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    contextLogout();
    navigate('/login');
  };

  const getProfile = async () => {
    const response = await axiosInstance.get('/auth/profile');
    const user = response.data.user;
    updateUser(user);
    return user;
  };

  return {
    ...authState,
    login,
    register,
    logout,
    getProfile,
    updateUser,
  };
};
