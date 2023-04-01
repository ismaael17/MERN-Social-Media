const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/users.js");

const app = express();
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("Hello world!"));
app.use("/api/users", userRoutes);

const port = process.env.PORT || 8082;

app.listen(port, () => console.log(`Server running on port ${port}`));
