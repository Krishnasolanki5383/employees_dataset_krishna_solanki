import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors([]);
  };

  const validateForm = () => {
    const localErrors = [];
    if (!formData.name.trim()) {
      localErrors.push('Name is required');
    }

    if (!formData.email) {
      localErrors.push('Email is required');
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      localErrors.push('Please enter a valid email address');
    }

    const { password, confirmPassword } = formData;
    if (!password) {
      localErrors.push('Password is required');
    } else {
      if (password.length < 8) {
        localErrors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        localErrors.push('Password must contain at least one uppercase letter');
      }
      if (!/[0-9]/.test(password)) {
        localErrors.push('Password must contain at least one number');
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        localErrors.push('Password must contain at least one special character');
      }
    }

    if (password !== confirmPassword) {
      localErrors.push('Passwords do not match');
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
      await register(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        setErrors(serverErrors);
      } else {
        setErrors([err.response?.data?.message || 'Registration failed. Check password criteria.']);
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Create Account</h2>
          <p className="text-sm text-brand-textMuted">Register a new Administrator or User</p>
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

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400">
            Account created successfully! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

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
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
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

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-2.5"
            >
              Sign Up
            </Button>
          </div>
        </form>

        <p className="text-center text-xs text-brand-textMuted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
