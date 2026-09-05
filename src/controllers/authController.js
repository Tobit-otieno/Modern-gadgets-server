const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/ApiError");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @desc    Log in an admin/staff user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !user.isActive) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc    Get the currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// @desc    Change your own password
// @route   PATCH /api/auth/me/password
// @access  Private
const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "currentPassword and newPassword are required");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "newPassword must be at least 8 characters");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password updated" });
});

// @desc    Create a new admin/staff user. If no users exist yet at all, this
//          creates the first super_admin with no token required (bootstrap).
//          Once any user exists, a logged-in super_admin token is required.
// @route   POST /api/auth/users
// @access  Public only for the very first user, otherwise Private/SuperAdmin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name, email and password are required");
  }

  const userCount = await User.countDocuments();

  if (userCount > 0 && (!req.user || req.user.role !== "super_admin")) {
    throw new ApiError(403, "Only a logged-in super_admin can create new users");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(400, "A user with that email already exists");

  // The very first user is always made super_admin, regardless of what was sent.
  const assignedRole = userCount === 0 ? "super_admin" : role;

  const user = await User.create({ name, email, password, role: assignedRole });

  res.status(201).json({
    success: true,
    data: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    List all admin/staff users
// @route   GET /api/auth/users
// @access  Private/SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("name");
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Update a user's role or active status
// @route   PATCH /api/auth/users/:id
// @access  Private/SuperAdmin
const updateUser = asyncHandler(async (req, res) => {
  const allowedUpdates = {};
  if (req.body.role) allowedUpdates.role = req.body.role;
  if (req.body.isActive !== undefined) allowedUpdates.isActive = req.body.isActive;
  if (req.body.name) allowedUpdates.name = req.body.name;

  const user = await User.findByIdAndUpdate(req.params.id, allowedUpdates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// @desc    Delete a user
// @route   DELETE /api/auth/users/:id
// @access  Private/SuperAdmin
const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new ApiError(400, "You cannot delete your own account");
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: {} });
});

module.exports = { login, getMe, changeMyPassword, createUser, getUsers, updateUser, deleteUser };