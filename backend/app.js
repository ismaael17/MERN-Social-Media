const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => res.send("Hello world!"));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
