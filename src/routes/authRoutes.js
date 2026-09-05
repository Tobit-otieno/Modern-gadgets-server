const express = require("express");
const router = express.Router();
const { protect, authorize, optionalAuth } = require("../middleware/auth");
const {
  login,
  getMe,
  changeMyPassword,
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

router.post("/login", login);

router.get("/me", protect, getMe);
router.patch("/me/password", protect, changeMyPassword);

// POST here is publicly reachable ONLY to create the very first user (bootstrap).
// Once one exists, createUser itself enforces that req.user must be a super_admin.
router.route("/users").post(optionalAuth, createUser).get(protect, authorize("super_admin"), getUsers);

router
  .route("/users/:id")
  .patch(protect, authorize("super_admin"), updateUser)
  .delete(protect, authorize("super_admin"), deleteUser);

module.exports = router;