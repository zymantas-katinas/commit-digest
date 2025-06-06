import { Controller, Get, Put, Body, UseGuards, Request } from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SupabaseService } from "../services/supabase.service";

@Controller("users")
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private supabaseService: SupabaseService) {}

  @Get("profile")
  async getProfile(@Request() req) {
    const userId = req.user.sub;

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
    const userId = req.user.sub;
    const { timezone } = body;

    // Validate timezone format (basic check)
    if (!timezone || typeof timezone !== "string") {
      throw new Error("Invalid timezone format");
    }

    try {
      // Test if timezone is valid by trying to use it
      new Date().toLocaleString("en-US", { timeZone: timezone });

      await this.supabaseService.updateUserTimezone(userId, timezone);

      return {
        success: true,
        message: "Timezone updated successfully",
        timezone: timezone,
      };
    } catch (error) {
      throw new Error("Invalid timezone or update failed");
    }
  }
}
