import { Module } from "@nestjs/common";
import { RepositoriesController } from "./repositories.controller";
import { ServicesModule } from "../services/services.module";

@Module({
  imports: [ServicesModule],
  controllers: [RepositoriesController],
})
export class RepositoriesModule {}
