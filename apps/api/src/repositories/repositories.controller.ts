import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../guards/supabase-auth.guard";
import { SupabaseService } from "../services/supabase.service";
import { GitService } from "../services/git.service";
import { EncryptionService } from "../services/encryption.service";
import { CreateRepositoryDto, GitProvider } from "../dto/create-repository.dto";
import { UpdateRepositoryDto } from "../dto/update-repository.dto";

@Controller("repositories")
@UseGuards(SupabaseAuthGuard)
export class RepositoriesController {
  constructor(
    private supabaseService: SupabaseService,
    private gitService: GitService,
    private encryptionService: EncryptionService,
  ) {}

  @Post()
  async createRepository(
    @Body() createRepositoryDto: CreateRepositoryDto,
    @Request() req,
  ) {
    try {
      const userId = req.user.id;

      // Check if user can create more repositories based on their subscription plan
      const { data: canCreate, error: limitError } = await this.supabaseService[
        "supabase"
      ].rpc("can_user_create_repository", { p_user_id: userId });

      if (limitError) {
        console.error("Error checking repository limit:", limitError);
        throw new HttpException(
          "Unable to verify subscription limits",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      if (!canCreate) {
        throw new HttpException(
          "Repository limit reached for your current plan. Upgrade to add more repositories.",
          HttpStatus.FORBIDDEN,
        );
      }

      const encryptedPat = createRepositoryDto.pat
        ? this.encryptionService.encrypt(createRepositoryDto.pat)
        : null;

      const provider =
        createRepositoryDto.provider ||
        this.gitService.detectProviderFromUrl(createRepositoryDto.githubUrl);

      const repository = await this.supabaseService.createRepository(
        userId,
        createRepositoryDto.githubUrl,
        encryptedPat,
        provider,
      );

      // Return repository without the encrypted PAT
      const { encrypted_access_token, ...repositoryResponse } = repository;
      return repositoryResponse;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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

      // Return repositories without encrypted PATs
      const repositoriesResponse = repositories.map((repo) => {
        const { encrypted_access_token, ...repoResponse } = repo;
        return repoResponse;
      });

      return repositoriesResponse;
    } catch (error) {
      throw new HttpException(
        "Failed to fetch repositories",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(":id/branches")
  async getRepositoryBranches(
    @Param("id") id: string,
    @Request() req,
    @Query("search") search?: string,
    @Query("page") page?: string,
    @Query("perPage") perPage?: string,
  ) {
    try {
      const userId = req.user.id;

      // Get the repository and verify ownership
      const repository = await this.supabaseService.getRepositoryById(id);
      if (!repository || repository.user_id !== userId) {
        throw new HttpException("Repository not found", HttpStatus.NOT_FOUND);
      }

      // Decrypt PAT if available
      const pat = repository.encrypted_access_token
        ? this.encryptionService.decrypt(repository.encrypted_access_token)
        : null;

      // Parse pagination parameters
      const pageNum = page ? parseInt(page, 10) : 1;
      const perPageNum = perPage ? parseInt(perPage, 10) : 30;

      // Validate pagination parameters
      if (pageNum < 1 || perPageNum < 1 || perPageNum > 100) {
        throw new HttpException(
          "Invalid pagination parameters",
          HttpStatus.BAD_REQUEST,
        );
      }

      const provider = (repository.provider || "github") as GitProvider;

      const result = await this.gitService.fetchBranches(
        repository.github_url,
        provider,
        pat,
        {
          search: search?.trim() || undefined,
          page: pageNum,
          perPage: perPageNum,
        },
      );

      return {
        branches: result.branches,
        pagination: {
          page: pageNum,
          perPage: perPageNum,
          hasMore: result.hasMore,
          totalCount: result.totalCount,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error("Fetch branches error:", error);
      throw new HttpException(
        "Failed to fetch repository branches",
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

      const updates: any = {};

      if (updateRepositoryDto.githubUrl) {
        updates.github_url = updateRepositoryDto.githubUrl;
        if (!updateRepositoryDto.provider) {
          updates.provider = this.gitService.detectProviderFromUrl(
            updateRepositoryDto.githubUrl,
          );
        }
      }

      if (updateRepositoryDto.provider) {
        updates.provider = updateRepositoryDto.provider;
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
