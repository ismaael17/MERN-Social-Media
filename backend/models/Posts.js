const mongoose = require("mongoose");

const RecipeStepSchema = new mongoose.Schema({
  stepNumber: Number,
  description: String,
  duration: Number, // Duration in seconds
  image: String, // Optional URL to an image for the step
});

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  brewingMethod: {
    type: String,
    required: true,
    enum: [
      "Pour Over",
      "Aeropress",
      "French Press",
      "Espresso",
      "Cold Brew",
      "Siphon",
    ],
  },
  coffeeBean: {
    type: String,
    required: true,
  },
  grindSize: {
    type: String,
    required: true,
  },
  coffeeWeight: {
    type: Number,
    required: true,
  },
  waterTemperature: {
    type: Number,
    default: 100,
    required: true,
  },
  waterWeight: {
    type: Number,
    required: true,
  },
  waterToCoffeeRatio: String,
  bloom: {
    duration: Number, // Duration in seconds
    waterWeight: Number,
  },
  steps: [RecipeStepSchema],
  totalTime: Number, // Total brewing time in seconds
  additionalNotes: String,
  images: [String], // Optional array of image URLs
});

const PostSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Recipe", "Coffee review", "Cafe review"],
  },
  recipe: RecipeSchema,
});

module.exports = mongoose.model("Post", PostSchema);
