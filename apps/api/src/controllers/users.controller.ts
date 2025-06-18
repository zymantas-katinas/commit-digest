import { Controller, Get, Put, Body, UseGuards, Request } from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SupabaseService } from "../services/supabase.service";

@Controller("users")
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private supabaseService: SupabaseService) {}

  @Get("profile")
  async getProfile(@Request() req) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new Error("User ID not found in token");
    }

    try {
      const timezone = await this.supabaseService.getUserTimezone(userId);
      return {
        id: userId,
        email: req.user.email,
        timezone: timezone,
      };
    } catch (error) {
      return {
        id: userId,
        email: req.user.email,
        timezone: "UTC",
      };
    }
  }

  @Put("timezone")
  async updateTimezone(@Request() req, @Body() body: { timezone: string }) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new Error("User ID not found in token");
    }

    const { timezone } = body;

    if (!timezone || typeof timezone !== "string") {
      throw new Error("Invalid timezone format");
    }

    try {
      new Date().toLocaleString("en-US", { timeZone: timezone });
    } catch (timezoneError) {
      console.error("Invalid timezone:", timezone, timezoneError);
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    try {
      await this.supabaseService.updateUserTimezone(userId, timezone);

      return {
        success: true,
        message: "Timezone updated successfully",
        timezone: timezone,
      };
    } catch (dbError) {
      console.error("Database error updating timezone:", dbError);
      throw new Error(
        `Failed to update timezone: ${dbError.message || "Unknown database error"}`,
      );
    }
  }

  @Put("profile")
  async updateProfile(@Request() req, @Body() body: { timezone?: string }) {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new Error("User ID not found in token");
    }

    const { timezone } = body;

    if (timezone) {
      if (typeof timezone !== "string") {
        throw new Error("Invalid timezone format");
      }

      try {
        new Date().toLocaleString("en-US", { timeZone: timezone });
      } catch (timezoneError) {
        console.error("Invalid timezone:", timezone, timezoneError);
        throw new Error(`Invalid timezone: ${timezone}`);
      }

      try {
        await this.supabaseService.updateUserTimezone(userId, timezone);
      } catch (dbError) {
        console.error("Database error updating timezone:", dbError);
        throw new Error(
          `Failed to update timezone: ${dbError.message || "Unknown database error"}`,
        );
      }
    }

    return {
      success: true,
      message: "Profile updated successfully",
      timezone: timezone,
    };
  }
}
