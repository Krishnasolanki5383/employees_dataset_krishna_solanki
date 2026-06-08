// routes/authRoutes.js
// Purpose: Defines all 13 authentication API endpoints.
//          Mounted under /auth in server.js.
//          Applies authMiddleware on protected profile/password routes.
//          Applies strictRateLimitMiddleware on sensitive auth endpoints.

const express = require('express');
const router  = express.Router();
const { authMiddleware }              = require('../middlewares/authMiddleware');
const { strictRateLimitMiddleware }   = require('../middlewares/rateLimitMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');
const {
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
} = require('../controllers/authController');

// ══════════════════════════════════════════════════════════════
//  SECTION 1: REGISTER & LOGIN (Public — no auth required)
// ══════════════════════════════════════════════════════════════

router.post('/register', strictRateLimitMiddleware, validateRegister, register);  // POST /auth/register
router.post('/login',    strictRateLimitMiddleware, validateLogin,    login);     // POST /auth/login
router.post('/logout',   logout);                                                  // POST /auth/logout

// ══════════════════════════════════════════════════════════════
//  SECTION 2: PROFILE MANAGEMENT (Protected — requires JWT)
// ══════════════════════════════════════════════════════════════

router.get   ('/profile', authMiddleware, getProfile);     // GET    /auth/profile
router.patch ('/profile', authMiddleware, updateProfile);  // PATCH  /auth/profile
router.delete('/profile', authMiddleware, deleteProfile);  // DELETE /auth/profile

// ══════════════════════════════════════════════════════════════
//  SECTION 3: PASSWORD MANAGEMENT
// ══════════════════════════════════════════════════════════════

router.post('/forgot-password',  strictRateLimitMiddleware, forgotPassword);                  // POST /auth/forgot-password
router.post('/reset-password',   resetPassword);                                               // POST /auth/reset-password
router.post('/change-password',  authMiddleware, changePassword);                             // POST /auth/change-password

// ══════════════════════════════════════════════════════════════
//  SECTION 4: EMAIL VERIFICATION & OTP
// ══════════════════════════════════════════════════════════════

router.post('/verify-email',       verifyEmail);                                              // POST /auth/verify-email
router.post('/send-otp',           strictRateLimitMiddleware, sendOtp);                       // POST /auth/send-otp
router.post('/verify-otp',         verifyOtp);                                                // POST /auth/verify-otp
router.post('/resend-verification',strictRateLimitMiddleware, resendVerification);             // POST /auth/resend-verification

module.exports = router;
