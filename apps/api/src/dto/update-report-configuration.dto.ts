import { IsString, IsOptional, Matches, IsBoolean } from "class-validator";

export class UpdateReportConfigurationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
    {
      message:
        'schedule must be a valid cron expression (e.g., "0 9 * * *" for daily at 9 AM)',
    },
  )
  schedule?: string;

  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.+/, {
    message: "webhook_url must be a valid HTTP or HTTPS URL",
  })
  webhook_url?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
