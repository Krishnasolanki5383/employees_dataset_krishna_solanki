// services/authService.js
// Purpose: Contains ALL business logic for authentication routes.
//          Controllers NEVER access DB directly — they call these functions.
//          Uses bcryptjs for password hashing, tokenHelper for JWT operations.
//          Follows strict MVC: this layer owns all auth logic.

const bcrypt      = require('bcryptjs');
const crypto      = require('crypto');
const User        = require('../models/userModel');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenHelper');

const SALT_ROUNDS = 12;

// ══════════════════════════════════════════════════════════════
//  SECTION 1: REGISTER & LOGIN
// ══════════════════════════════════════════════════════════════

/**
 * register
 * Validates email/password, hashes password, saves user, returns JWT.
 */
const register = async ({ name, email, password, role = 'user' }) => {
  // Check for existing user
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('User with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  // Generate JWT
  const token        = generateToken({ id: user._id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    refreshToken,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

/**
 * login
 * Finds user by email, compares password with bcrypt, returns JWT.
 */
const login = async ({ email, password }) => {
  // Find user with password field included (select:false by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Generate tokens
  const token        = generateToken({ id: user._id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role });

  return {
    token,
    refreshToken,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
  };
};

/**
 * logout
 * In stateless JWT, logout is handled client-side.
 * Returns a success message instructing the client to clear the token.
 */
const logout = async () => {
  return { message: 'Logged out successfully. Please clear your token on the client side.' };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: PROFILE MANAGEMENT
// ══════════════════════════════════════════════════════════════

/**
 * getProfile
 * Returns user profile data from the database by ID.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * updateProfile
 * Updates name and/or email for the authenticated user.
 */
const updateProfile = async (userId, updates) => {
  const { name, email } = updates;
  const user = await User.findByIdAndUpdate(
    userId,
    { ...(name && { name }), ...(email && { email }) },
    { new: true, runValidators: true }
  ).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * deleteProfile
 * Permanently deletes the authenticated user's account.
 */
const deleteProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return { message: 'Account deleted successfully' };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: PASSWORD MANAGEMENT
// ══════════════════════════════════════════════════════════════

/**
 * forgotPassword
 * Generates a reset token and logs the reset link (console.log).
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('No account found with that email address');
    err.statusCode = 404;
    throw err;
  }

  // Generate a secure random reset token
  const resetToken  = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken:  resetToken,
    resetPasswordExpiry: resetExpiry,
  });

  // In production: send via email. Here: console.log for demonstration.
  const resetUrl = `http://localhost:5000/auth/reset-password?token=${resetToken}`;
  console.log(`\n📧 [PASSWORD RESET] Reset link for ${email}:\n${resetUrl}\n`);

  return { message: `Password reset link sent to ${email}. Check console for demo URL.` };
};

/**
 * resetPassword
 * Verifies reset token, hashes new password, saves it.
 */
const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken:  token,
    resetPasswordExpiry: { $gt: new Date() }, // not expired
  });

  if (!user) {
    const err = new Error('Invalid or expired password reset token');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await User.findByIdAndUpdate(user._id, {
    password:            hashedPassword,
    resetPasswordToken:  null,
    resetPasswordExpiry: null,
  });

  return { message: 'Password has been reset successfully. Please log in.' };
};

/**
 * changePassword
 * Verifies old password, hashes and saves new password.
 */
const changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  return { message: 'Password changed successfully. Please log in again.' };
};

// ══════════════════════════════════════════════════════════════
//  SECTION 4: EMAIL VERIFICATION & OTP
// ══════════════════════════════════════════════════════════════

/**
 * verifyEmail
 * Marks user's email as verified using the email verification token.
 */
const verifyEmail = async (token) => {
  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    const err = new Error('Invalid verification token');
    err.statusCode = 400;
    throw err;
  }

  await User.findByIdAndUpdate(user._id, {
    isEmailVerified:        true,
    emailVerificationToken: null,
  });

  return { message: 'Email verified successfully. You can now log in.' };
};

/**
 * sendOtp
 * Generates a 6-digit OTP, saves it with 10-minute expiry, logs it.
 */
const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('No account found with that email address');
    err.statusCode = 404;
    throw err;
  }

  const otp      = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);              // 10 minutes

  await User.findByIdAndUpdate(user._id, {
    otp,
    otpExpiry,
    isOtpVerified: false,
  });

  // In production: send via SMS/email. Here: console.log for demonstration.
  console.log(`\n🔑 [OTP] OTP for ${email}: ${otp} (expires in 10 minutes)\n`);

  return { message: `OTP sent to ${email}. Check console for demo OTP.` };
};

/**
 * verifyOtp
 * Finds OTP in DB, checks expiry, marks as verified.
 */
const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email, otp });
  if (!user) {
    const err = new Error('Invalid OTP');
    err.statusCode = 400;
    throw err;
  }

  if (user.otpExpiry < new Date()) {
    const err = new Error('OTP has expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  await User.findByIdAndUpdate(user._id, {
    isOtpVerified: true,
    otp:           null,
    otpExpiry:     null,
  });

  return { message: 'OTP verified successfully.' };
};

/**
 * resendVerification
 * Generates a new email verification token and logs the link.
 */
const resendVerification = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('No account found with that email address');
    err.statusCode = 404;
    throw err;
  }

  if (user.isEmailVerified) {
    const err = new Error('Email is already verified');
    err.statusCode = 400;
    throw err;
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  await User.findByIdAndUpdate(user._id, { emailVerificationToken: verificationToken });

  const verifyUrl = `http://localhost:5000/auth/verify-email?token=${verificationToken}`;
  console.log(`\n📧 [VERIFY EMAIL] Verification link for ${email}:\n${verifyUrl}\n`);

  return { message: `Verification email resent to ${email}. Check console for demo URL.` };
};

// ══════════════════════════════════════════════════════════════
//  EXPORTS
// ══════════════════════════════════════════════════════════════

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  deleteProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  sendOtp,
  verifyOtp,
  resendVerification,
};
