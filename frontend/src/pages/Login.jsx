import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors([]);
  };

  const validateForm = () => {
    const localErrors = [];
    if (!formData.email) {
      localErrors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      localErrors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      localErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      localErrors.push('Password must be at least 6 characters long');
    }

    setErrors(localErrors);
    return localErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors([]);
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        setErrors(serverErrors);
      } else {
        setErrors([err.response?.data?.message || 'Login failed. Invalid credentials.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-brand-card border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">⚙️</span>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-sm text-brand-textMuted">Sign in to your Employee Portal account</p>
        </div>

        {errors.length > 0 && (
          <div className="bg-brand-danger/10 border border-brand-danger/20 rounded-lg p-3 text-xs text-brand-danger">
            <ul className="list-disc pl-4 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@domain.com"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-white"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-2.5"
            >
              Sign In
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-brand-textMuted mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
