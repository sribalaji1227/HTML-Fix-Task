const express = require("express");
const cors = require("cors");
const fileRoutes = require("./src/routes/fileRoutes");
const rateLimit = require("express-rate-limit");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/files/upload", fileRoutes);

// Rate limiting to prevent DOS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error!" });
});

const PORT = 3000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
