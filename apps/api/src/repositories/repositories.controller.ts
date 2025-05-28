import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SupabaseService } from "../services/supabase.service";
import { EncryptionService } from "../services/encryption.service";
import { CreateRepositoryDto } from "../dto/create-repository.dto";
import { UpdateRepositoryDto } from "../dto/update-repository.dto";

@Controller("repositories")
@UseGuards(SupabaseAuthGuard)
export class RepositoriesController {
  constructor(
    private supabaseService: SupabaseService,
    private encryptionService: EncryptionService,
  ) {}

  @Post()
  async createRepository(
    @Body() createRepositoryDto: CreateRepositoryDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;
      const encryptedPat = this.encryptionService.encrypt(
        createRepositoryDto.pat,
      );

      const repository = await this.supabaseService.createRepository(
        userId,
        createRepositoryDto.githubUrl,
        createRepositoryDto.branch,
        encryptedPat,
      );

      // Return repository without the encrypted PAT
      const { encrypted_access_token, ...repositoryResponse } = repository;
      return repositoryResponse;
    } catch (error) {
      throw new HttpException(
        "Failed to create repository",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getRepositories(@Request() req) {
    try {
      const userId = req.user.id;
      const repositories =
        await this.supabaseService.getRepositoriesByUserId(userId);

      // Return repositories without the encrypted PATs
      return repositories.map(({ encrypted_access_token, ...repo }) => repo);
    } catch (error) {
      console.error("Error fetching repositories:", error);
      throw new HttpException(
        "Failed to fetch repositories",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(":id")
  async updateRepository(
    @Param("id") id: string,
    @Body() updateRepositoryDto: UpdateRepositoryDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;

      // Build update object
      const updates: any = {};

      if (updateRepositoryDto.githubUrl) {
        updates.github_url = updateRepositoryDto.githubUrl;
      }

      if (updateRepositoryDto.branch) {
        updates.branch = updateRepositoryDto.branch;
      }

      if (updateRepositoryDto.pat) {
        updates.encrypted_access_token = this.encryptionService.encrypt(
          updateRepositoryDto.pat,
        );
      }

      const repository = await this.supabaseService.updateRepository(
        id,
        userId,
        updates,
      );

      // Return repository without the encrypted PAT
      const { encrypted_access_token, ...repositoryResponse } = repository;
      return repositoryResponse;
    } catch (error) {
      console.error("Update repository error:", error);
      throw new HttpException(
        "Failed to update repository",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  async deleteRepository(@Param("id") id: string, @Request() req) {
    try {
      const userId = req.user.id;
      await this.supabaseService.deleteRepository(id, userId);
      return { message: "Repository deleted successfully" };
    } catch (error) {
      throw new HttpException(
        "Failed to delete repository",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
