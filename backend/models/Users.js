const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const genSalt = bcrypt.genSalt;
const hash = bcrypt.hash;
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash the password before saving the user document
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  next();
});

// Method to compare the provided password with the hashed password in the database
UserSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};
module.exports = mongoose.model("User", UserSchema);
