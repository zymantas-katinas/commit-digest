import {
  IsString,
  IsUrl,
  IsNotEmpty,
  Matches,
  IsOptional,
  IsBoolean,
  IsEnum,
} from "class-validator";
import {
  REPORT_STYLE,
  TONE_OF_VOICE,
  REPORT_CONFIGURATION_DEFAULTS,
} from "./report-configuration-enums";

export class CreateReportConfigurationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  repositoryId: string;

  @IsString()
  @IsNotEmpty()
  branch: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
    {
      message:
        'schedule must be a valid cron expression (e.g., "0 9 * * *" for daily at 9 AM)',
    },
  )
  schedule: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^https?:\/\/.+/, {
    message: "webhook_url must be a valid HTTP or HTTPS URL",
  })
  webhook_url: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  // New report configuration settings
  @IsEnum(REPORT_STYLE)
  @IsOptional()
  report_style?: REPORT_STYLE;

  @IsEnum(TONE_OF_VOICE)
  @IsOptional()
  tone_of_voice?: TONE_OF_VOICE;

  @IsBoolean()
  @IsOptional()
  author_display?: boolean;

  @IsBoolean()
  @IsOptional()
  link_to_commits?: boolean;

  @IsBoolean()
  @IsOptional()
  if_no_updates?: boolean;
}
