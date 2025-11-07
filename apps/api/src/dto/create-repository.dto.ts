import {
  IsString,
  IsUrl,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from "class-validator";

export enum GitProvider {
  GITHUB = "github",
  GITLAB = "gitlab",
}

export class CreateRepositoryDto {
  @IsUrl()
  @IsNotEmpty()
  githubUrl: string;

  @IsEnum(GitProvider)
  @IsOptional()
  provider?: GitProvider;

  @IsString()
  @IsOptional()
  pat?: string;
}
