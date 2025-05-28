import { IsString, IsNotEmpty, IsDateString } from "class-validator";

export class ManualTriggerDto {
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  @IsDateString()
  toDate: string;
}
