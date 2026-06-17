import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);

  // Form validation schema with Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrors([]);
        await login(values.email, values.password);
        toast.success('Successfully logged in!');
        navigate('/');
      } catch (err) {
        const serverErrors = err.response?.data?.errors;
        if (Array.isArray(serverErrors) && serverErrors.length > 0) {
          setErrors(serverErrors);
        } else {
          setErrors([err.response?.data?.message || 'Login failed. Invalid credentials.']);
        }
        toast.error(err.response?.data?.message || 'Login failed. Invalid credentials.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-4 transition-colors">
      <Helmet>
        <title>Login | EMS Portal</title>
        <meta name="description" content="Sign in to your Employee Management System account to manage employee records, view analytics, and update settings." />
      </Helmet>

      <div className="w-full max-w-md bg-brand-card border border-gray-800/10 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">⚙️</span>
          <h2 className="text-2xl font-bold tracking-tight text-brand-text">Welcome Back</h2>
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

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && formik.errors.email}
            placeholder="example@domain.com"
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-brand-textMuted hover:text-brand-primary cursor-pointer"
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={formik.isSubmitting}
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

