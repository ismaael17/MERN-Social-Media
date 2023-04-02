const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/Posts");

// @route   POST api/posts
// @descr   Create a new post
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  const { title, content, postType, recipe } = req.body;
  const { userId } = req.user;
  const waterWeight = recipe.waterWeight;
  const coffeeWeight = recipe.coffeeWeight;
  recipe.waterToCoffeeRatio = waterWeight / coffeeWeight;

  try {
    const newPost = new Post({
      title,
      content,
      postType,
      recipe,
      creator: userId,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
