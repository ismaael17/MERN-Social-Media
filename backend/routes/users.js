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

// @route   PUT api/:userId
// @descr   Updates the information of the logged-in user
// @access  The userId owner
router.put("/:userID", authMiddleware, async (req, res) => {
  try {
    // Use findById instead of findOne for finding user by ID
    const user = await User.findById(req.params.userID);
    if (user) {
      // Use toString() to compare ObjectId with a string
      if (user._id.toString() === req.user.userID) {
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        if (username) {
          const existingUsername = User.findOne({ username: username });
          if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
          }
          user.username = username;
        }

        // pre save hook defined by the user model so no need to hash password before saving it
        if (password) {
          user.password = password;
        }

        if (email) {
          const existingEmail = User.findOne({ email: email });
          if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
          }
          user.email = email;
        }

        const updatedUser = await user.save();
        updatedUser.password = undefined;
        return res.status(200).json({ user: updatedUser });
      } else {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this user" });
      }
    } else {
      return res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// @route   DELETE api/:userID
// @descr   Deletes the user with id userID
// @access  The userID owner
router.delete("/:userID", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userID);
    if (user) {
      if (user._id.toString() === req.params.userID) {
        await user.remove();
      } else {
        return res
          .status(403)
          .json({ message: "Unauthorized to delete this user" });
      }
    } else {
      return res.status(404).json({ message: "User not foundd" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
