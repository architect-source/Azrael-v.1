import express from "express";
import cors from "cors";
import router from "../src/lib/router";

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Mount the router on both /api and / to handle Vercel's flexible routing
app.use("/api", router);
app.use("/", router); 

// Catch-all for API routes to provide better diagnostics
app.use("/api", (req, res) => {
  res.status(404).json({ 
    error: "API_ROUTE_NOT_FOUND", 
    path: req.path,
    method: req.method,
    suggestion: "Check if the route is defined in src/lib/router.ts"
  });
});

export default app;
