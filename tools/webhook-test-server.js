#!/usr/bin/env node

const express = require("express");
const app = express();
const port = process.env.WEBHOOK_PORT || 3002;

// Middleware to parse JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Add timestamp to logs
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Webhook endpoint
app.post("/webhook", (req, res) => {
  log("🎯 Webhook received!");
  log("Headers:");
  console.log(JSON.stringify(req.headers, null, 2));
  log("Body:");
  console.log(JSON.stringify(req.body, null, 2));
  log("─".repeat(80));

  // Respond with success
  res.status(200).json({
    message: "Webhook received successfully",
    timestamp: new Date().toISOString(),
    bodySize: JSON.stringify(req.body).length,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Catch all other routes
app.all("*", (req, res) => {
  log(`📨 ${req.method} ${req.path} - ${req.ip}`);
  res.status(404).json({
    error: "Not found",
    availableEndpoints: [
      "POST /webhook - Receive webhook payloads",
      "GET /health - Health check",
    ],
  });
});

// Start server
app.listen(port, () => {
  log(`🚀 Webhook test server running on http://localhost:${port}`);
  log(`📡 Webhook URL: http://localhost:${port}/webhook`);
  log(`💚 Health check: http://localhost:${port}/health`);
  log("─".repeat(80));
  log("Waiting for webhooks...");
});

// Graceful shutdown
process.on("SIGINT", () => {
  log("👋 Shutting down webhook test server...");
  process.exit(0);
});
