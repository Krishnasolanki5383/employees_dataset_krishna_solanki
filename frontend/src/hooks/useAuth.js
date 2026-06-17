import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { loginSuccess, logoutSuccess, updateUser as updateAuthUser } from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const isLoading = false; // Synchronous localStorage retrieval makes loading immediate

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token: userToken, user: userData } = response.data.data;
    dispatch(loginSuccess({ user: userData, token: userToken }));
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    dispatch(logoutSuccess());
    navigate('/login');
  };

  const getProfile = async () => {
    const response = await axiosInstance.get('/auth/profile');
    const userData = response.data.data;
    dispatch(updateAuthUser(userData));
    return userData;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    getProfile,
    updateUser: (userData) => dispatch(updateAuthUser(userData)),
  };
};

