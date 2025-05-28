import { Module } from "@nestjs/common";
import { ReportRunsController } from "./report-runs.controller";
import { ServicesModule } from "../services/services.module";

@Module({
  imports: [ServicesModule],
  controllers: [ReportRunsController],
})
export class ReportRunsModule {}
