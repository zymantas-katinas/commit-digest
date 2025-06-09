import { IsString, IsUrl, IsOptional } from "class-validator";

export class UpdateRepositoryDto {
  @IsUrl()
  @IsOptional()
  githubUrl?: string;

  @IsString()
  @IsOptional()
  pat?: string; // Personal Access Token
}
