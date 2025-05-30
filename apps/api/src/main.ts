import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configure raw body parsing for webhook endpoint only
  app.useBodyParser("json", {
    verify: (req: any, res, buf) => {
      // Store raw body for webhook signature verification
      if (req.originalUrl === "/subscriptions/webhook") {
        req.rawBody = buf;
      }
    },
  });

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
