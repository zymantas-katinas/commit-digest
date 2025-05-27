import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { AuthModule } from "./auth/auth.module";
import { RepositoriesModule } from "./repositories/repositories.module";
import { ReportConfigurationsModule } from "./report-configurations/report-configurations.module";
import { ServicesModule } from "./services/services.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    RepositoriesModule,
    ReportConfigurationsModule,
    ServicesModule,
  ],
})
export class AppModule {}
