const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const { body, validationResult } = require("express-validator");
const User = require("../models/Users");
const authMiddleware = require("../middleware/authMiddleware");

const userValidationRules = [
  body("email").isEmail().withMessage("Email is not valid."),
  body("username").notEmpty().withMessage("Username is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

// @route   POST api/users
// @desc    Create a user
// @access  Public
router.post("/", userValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    try {
      const user = await userService.createUser(req.body);
      // Generate the JWT token
      const token = userService.generateToken(user.id);

      // Remove the password field from the user object
      user.password = undefined;
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
});

// @route   POST api/login
// @desc    Login the user and return JWT
// @access  Registered users
router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });
    if (!user) {
      res.status(400).json({ message: "user does not exist" });
    } else {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
      } else {
        const token = userService.generateToken(user.id);
        user.password = undefined;
        return res.status(200).json({
          token,
          user,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error :(" });
  }
});

// @route   Get api/user/personal
// @descr   Returns the information of the current user
// @access  A logged in user
router.get("/personal", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    user.password = undefined;
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
});

// @route   GET api/users/:username
// @descr   Returns the information of the specified user
// @access  A logged in user
router.get("/:username", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (user) {
      user.password = undefined;
      return res.status(200).json(user);
    } else {
      return res.status(200).json({ message: "User not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
