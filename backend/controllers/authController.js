// controllers/authController.js
// Purpose: Handles HTTP request/response for authentication routes.
//          NO business logic. NO DB queries.
//          Delegates ALL logic to authService.
//          Follows strict MVC: controllers own req/res, services own logic.

const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: REGISTER & LOGIN
// ══════════════════════════════════════════════════════════════

/**
 * POST /auth/register
 * Registers a new user, returns JWT token.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register({ name, email, password, role });
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 * Authenticates user and returns JWT + refresh token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout
 * Logs out user — instructs client to clear the token.
 */
const logout = async (req, res, next) => {
  try {
    const result = await authService.logout();
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 2: PROFILE MANAGEMENT
// ══════════════════════════════════════════════════════════════

/**
 * GET /auth/profile
 * Returns the authenticated user's profile. Requires authMiddleware.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 200, 'Profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /auth/profile
 * Updates name or email for the authenticated user.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /auth/profile
 * Permanently deletes the authenticated user's account.
 */
const deleteProfile = async (req, res, next) => {
  try {
    const result = await authService.deleteProfile(req.user.id);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 3: PASSWORD MANAGEMENT
// ══════════════════════════════════════════════════════════════

/**
 * POST /auth/forgot-password
 * Sends a password reset link to the user's email (console.log for demo).
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required');
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/reset-password
 * Resets the password using the token from the reset link.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return sendError(res, 400, 'Token and new password are required');
    const result = await authService.resetPassword(token, newPassword);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/change-password
 * Changes password for the authenticated user. Requires authMiddleware.
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return sendError(res, 400, 'Old password and new password are required');
    const result = await authService.changePassword(req.user.id, { oldPassword, newPassword });
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

// ══════════════════════════════════════════════════════════════
//  SECTION 4: EMAIL VERIFICATION & OTP
// ══════════════════════════════════════════════════════════════

/**
 * POST /auth/verify-email
 * Verifies email using the token from the verification link.
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return sendError(res, 400, 'Verification token is required');
    const result = await authService.verifyEmail(token);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/send-otp
 * Sends a 6-digit OTP to the user's email (console.log for demo).
 */
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required');
    const result = await authService.sendOtp(email);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/verify-otp
 * Verifies the OTP submitted by the user.
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return sendError(res, 400, 'Email and OTP are required');
    const result = await authService.verifyOtp(email, otp);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/resend-verification
 * Resends email verification link to the user.
 */
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, 'Email is required');
    const result = await authService.resendVerification(email);
    return sendSuccess(res, 200, result.message, null);
  } catch (error) {
    next(error);
  }
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
