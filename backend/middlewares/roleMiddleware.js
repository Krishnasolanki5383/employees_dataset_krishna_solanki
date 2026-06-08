// middlewares/roleMiddleware.js
// Purpose: Checks that the authenticated user has the 'admin' role.
//          Must be chained AFTER authMiddleware (which sets req.user).
//          Returns 403 Forbidden if role is not 'admin'.

const { sendError } = require('../utils/responseHelper');

/**
 * roleMiddleware
 * Middleware chain for admin routes: authMiddleware → roleMiddleware → controller
 * Expects: req.user.role to be set by authMiddleware.
 */
const roleMiddleware = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Unauthorized. Authentication required.');
  }

  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Forbidden. Admin access required.');
  }

  next();
};

module.exports = { roleMiddleware };
