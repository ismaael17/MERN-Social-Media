const User = require("../models/Users");

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

module.exports = createUser;
