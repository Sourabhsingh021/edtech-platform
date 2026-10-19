import express from "express";

const app = express();

// Middleware
app.use(express.json());

// Health-check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EdTech Platform API is running",
  });
});

export default app;
