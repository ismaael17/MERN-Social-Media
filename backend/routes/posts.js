const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Post = require("../models/Posts");
const User = require("../models/Users");

// @route   POST api/posts
// @descr   Create a new post
// @access  Logged in users
router.post("/", authMiddleware, async (req, res) => {
  try {
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

// @route   GET api/posts/user/:userID
// @descr   Gets all the posts of the specified user
// @access  Logged in users
router.get("/user/:userID", authMiddleware, async (req, res) => {
  try {
    if (req.params.userID.length !== 24) {
      return res.status(404).json({ message: "Invalid userID" });
    } else {
      const user = await User.findById(req.params.userID);
      if (user) {
        const posts = await Post.find({ creator: req.params.userID });
        return res.status(200).json(posts);
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
});
// @route   PUT api/posts/:postId
// @desc    Update a post
// @access  Post owner
router.put("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content, postType, recipe } = req.body;
  const { userId } = req.user;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.creator.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this post" });
    }

    // Update the post fields
    if (title !== undefined) {
      post.title = title;
    }
    if (content !== undefined) {
      post.content = content;
    }
    if (postType !== undefined) {
      post.postType = postType;
    }
    if (recipe !== undefined) {
      // Update the recipe fields
      if (recipe.method !== undefined) {
        post.recipe.method = recipe.method;
      }
      if (recipe.waterWeight !== undefined) {
        post.recipe.waterWeight = recipe.waterWeight;
        post.recipe.waterToCoffeeRatio =
          post.recipe.waterWeight / post.recipe.coffeeWeight;
      }
      if (recipe.coffeeWeight !== undefined) {
        post.recipe.coffeeWeight = recipe.coffeeWeight;
        post.recipe.waterToCoffeeRatio =
          post.recipe.waterWeight / post.recipe.coffeeWeight;
      }
      if (recipe.steps !== undefined) {
        post.recipe.steps = recipe.steps;
      }
      if (recipe.waterToCoffeeRatio !== undefined) {
        post.recipe.waterToCoffeeRatio = recipe.waterToCoffeeRatio;
      }
      if (recipe.title !== undefined) {
        post.recipe.title = recipe.title;
      }
      if (recipe.description !== undefined) {
        post.recipe.description = recipe.description;
      }
      if (recipe.brewingMethod !== undefined) {
        post.recipe.brewingMethod = recipe.brewingMethod;
      }
      if (recipe.coffeeBean !== undefined) {
        post.recipe.coffeeBean = recipe.coffeeBean;
      }
      if (recipe.grindSize !== undefined) {
        post.recipe.grindSize = recipe.grindSize;
      }
      if (recipe.waterTemperature !== undefined) {
        post.recipe.waterTemperature = recipe.waterTemperature;
      }
      if (recipe.bloom !== undefined) {
        if (recipe.bloom.duration !== undefined) {
          post.recipe.bloom.duration = recipe.bloom.duration;
        }
        if (recipe.bloom.waterWeight !== undefined) {
          post.recipe.bloom.waterWeight = recipe.bloom.waterWeight;
        }
      }
      if (recipe.totalTime !== undefined) {
        post.recipe.totalTime = recipe.totalTime;
      }
      if (recipe.additionalNotes !== undefined) {
        post.recipe.additionalNotes = recipe.additionalNotes;
      }
      if (recipe.images !== undefined) {
        post.recipe.images = recipe.images;
      }
    }

    // Save the updated post
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
