const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/Posts");

// @route   POST api/posts
// @descr   Create a new post
// @access  Logged in users
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

// @route   GET api/posts
// @descr   Gets all the posts
// @access  Logged in users
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find();
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// @route   GET api/posts/:postID
// @descr   Gets the specified post
// @access  Logged in users
router.get("/:postID", authMiddleware, async (req, res) => {
  try {
    if (req.params.postID.length !== 24) {
      return res.status(404).json({ message: "Invalid postID" });
    }
    const post = await Post.findById(req.params.postID);
    if (post) {
      return res.status(200).json({ post });
    } else {
      return res.status(404).json({ message: "Post not found." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
