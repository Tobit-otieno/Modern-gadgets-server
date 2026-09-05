const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ApiError = require("./ApiError");
const User = require("../models/User");

// Verifies the Bearer token and attaches the logged-in user to req.user.
// Use on any route that requires someone to be logged in.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized — no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new ApiError(401, "Not authorized — user not found or deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Not authorized — invalid or expired token");
  }
});

// Restricts a route to one or more roles. Use after `protect`.
// e.g. router.delete("/:id", protect, authorize("super_admin"), deleteUser)
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

// Like `protect`, but doesn't fail the request if no/invalid token is given —
// it just leaves req.user undefined. Used where a route's access rule depends
// on something else too (e.g. "only if this is the very first user").
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch (error) {
      // Ignore invalid/expired tokens here — the controller decides what's required.
    }
  }

  next();
});

module.exports = { protect, authorize, optionalAuth };