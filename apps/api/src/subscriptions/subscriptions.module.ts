import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { ServicesModule } from "../services/services.module";

@Module({
  imports: [ConfigModule, ServicesModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
