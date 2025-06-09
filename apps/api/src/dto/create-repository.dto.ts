import { IsString, IsUrl, IsNotEmpty, IsOptional } from "class-validator";

export class CreateRepositoryDto {
  @IsUrl()
  @IsNotEmpty()
  githubUrl: string;

  @IsString()
  @IsOptional()
  pat?: string;
}
