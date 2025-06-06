import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { ReportConfigurationsModule } from "./report-configurations/report-configurations.module";
import { ReportRunsModule } from "./report-runs/report-runs.module";
import { ServicesModule } from "./services/services.module";
import { HealthModule } from "./health/health.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { UsersController } from "./controllers/users.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    RepositoriesModule,
    ReportConfigurationsModule,
    ReportRunsModule,
    ServicesModule,
    HealthModule,
    SubscriptionsModule,
  ],
  controllers: [UsersController],
})
export class AppModule {}
