import { IsString, IsUrl, IsNotEmpty } from "class-validator";

export class CreateRepositoryDto {
  @IsUrl()
  @IsNotEmpty()
  githubUrl: string;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsString()
  @IsNotEmpty()
  pat: string; // Personal Access Token
}
