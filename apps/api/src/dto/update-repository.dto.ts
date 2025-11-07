import { IsString, IsUrl, IsOptional, IsEnum } from "class-validator";
import { GitProvider } from "./create-repository.dto";

export class UpdateRepositoryDto {
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsEnum(GitProvider)
  @IsOptional()
  provider?: GitProvider;

  @IsString()
  @IsOptional()
  pat?: string;
}
