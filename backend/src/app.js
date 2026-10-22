import express from "express";
import router from "./routes/routes.js";
import cookieParser from "cookie-parser"

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/v1", router)

// Health-check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EdTech Platform API is running",
  });
});

export default app;
