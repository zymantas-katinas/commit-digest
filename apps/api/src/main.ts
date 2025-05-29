import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure middleware for webhook endpoints to receive raw body
  app.use("/subscriptions/webhook", express.raw({ type: "application/json" }));

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

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`API server running on port ${port}`);
}

bootstrap();
