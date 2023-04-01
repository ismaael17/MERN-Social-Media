const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const createUser = async (userData) => {
  //check for existing user
  const usernameExists = await User.findOne({ username: userData.username });
  const emailExists = await User.findOne({ email: userData.email });
  if (usernameExists) {
    throw new Error("A user with this username already exists");
  }
  if (emailExists) {
    throw new Error("A user with this email already exists");
  }

  const newUser = new User(userData);
  const savedUser = await newUser.save();

  return savedUser;
};

const generateToken = (userID) => {
  // Generate the JWT token
  const payload = { userId: userID };
  const jwtOptions = { expiresIn: "1d" }; // Set the token expiration time, e.g., 1 day
  const token = jwt.sign(payload, config.jwtSecret, jwtOptions);
  return token;
};
module.exports = {
  createUser,
  generateToken,
};
