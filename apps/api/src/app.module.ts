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
})
export class AppModule {}
