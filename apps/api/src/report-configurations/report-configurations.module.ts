import { Module } from "@nestjs/common";
import { ReportConfigurationsController } from "./report-configurations.controller";
import { ServicesModule } from "../services/services.module";

@Module({
  imports: [ServicesModule],
  controllers: [ReportConfigurationsController],
})
export class ReportConfigurationsModule {}
