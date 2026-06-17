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

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  // Form validation schema with Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required('Name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  // Form handling with Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setErrors([]);
        await register(values.name, values.email, values.password);
        setSuccess(true);
        toast.success('Registration successful! Redirecting to login...');
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
        toast.error(err.response?.data?.message || 'Registration failed.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center items-center px-4 transition-colors">
      <Helmet>
        <title>Register | EMS Portal</title>
        <meta name="description" content="Register a new admin or user account on the Employee Management System." />
      </Helmet>

      <div className="w-full max-w-md bg-brand-card border border-gray-800/10 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-4xl">⚙️</span>
          <h2 className="text-2xl font-bold tracking-tight text-brand-text">Create Account</h2>
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

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && formik.errors.name}
            placeholder="John Doe"
            required
          />

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
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
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

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && formik.errors.confirmPassword}
              placeholder="Re-enter password"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              loading={formik.isSubmitting}
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

