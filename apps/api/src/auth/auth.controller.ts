import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";

@Controller("auth")
export class AuthController {
  @Get("me")
  @UseGuards(SupabaseAuthGuard)
  async getMe(@Request() req) {
    return {
      user: req.user,
    };
  }
}
