const express = require("express");
const router = express.Router();
const createUser = require("../services/userService");
const validator = require("validator");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

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
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  } else {
    try {
      const user = await createUser(req.body);
      // Generate the JWT token
      const payload = { userId: user._id };
      const jwtOptions = { expiresIn: "1d" }; // Set the token expiration time, e.g., 1 day
      const token = jwt.sign(payload, config.jwtSecret, jwtOptions);

      // Remove the password field from the user object
      user.password = undefined;
      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
});

// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get("/", (req, res) => {
  find()
    .then((users) => res.json(users))
    .catch((err) => res.status(404).json({ nousersfound: "No Users found" }));
});

module.exports = router;
