// Vercel serverless function entry point
const { NestFactory } = require("@nestjs/core");
const { AppModule } = require("../dist/app.module");
const { ValidationPipe } = require("@nestjs/common");
const express = require("express");

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS for frontend communication
    app.enableCors({
      origin: [
        "http://localhost:3000", // Next.js dev server
        "http://127.0.0.1:3000", // Alternative localhost
        process.env.FRONTEND_URL, // Production frontend URL
      ].filter(Boolean), // Remove undefined values
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Enable global validation
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  // Handle raw body specifically for Stripe webhook
  if (req.url === "/subscriptions/webhook" && req.method === "POST") {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      req.body = Buffer.from(body, "utf8");
      const app = await createApp();
      const expressApp = app.getHttpAdapter().getInstance();
      return expressApp(req, res);
    });
    return;
  }

  // For all other routes, use normal processing
  const app = await createApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
