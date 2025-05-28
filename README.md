# Git Report - AI-Powered Commit Reporting Tool

An automated Git commit reporting tool that uses AI to generate intelligent summaries of repository activity and delivers them via webhooks.

## Features

- **Repository Management**: Connect GitHub repositories with Personal Access Tokens
- **AI-Powered Summaries**: Uses OpenAI GPT-4o Mini to generate intelligent commit summaries
- **Automated Scheduling**: Configure daily or weekly reports with smart date range detection
- **Enable/Disable Reports**: Toggle report configurations on/off without deleting them
- **Webhook Testing**: Manual webhook testing with detailed feedback and commit analysis
- **Webhook Delivery**: Send reports to any webhook endpoint with retry logic and rich metadata
- **Secure Storage**: Encrypted storage of GitHub Personal Access Tokens
- **Modern UI**: Beautiful dashboard built with Next.js and Shadcn/ui

## Tech Stack

### Backend (API)

- **Framework**: Nest.js with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT
- **AI Integration**: Langchain with OpenAI GPT-4o Mini
- **Scheduling**: Node-cron for automated report generation
- **Security**: AES-256-GCM encryption for sensitive data

### Frontend (Web)

- **Framework**: Next.js 14 with App Router
- **UI Components**: Shadcn/ui with Tailwind CSS
- **State Management**: Zustand for auth state
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation

## Project Structure

```
git-report/
├── apps/
│   ├── api/          # Nest.js backend API
│   └── web/          # Next.js frontend
├── package.json      # Root package.json
├── pnpm-workspace.yaml
└── turbo.json        # Turborepo configuration
```

## Database Schema

### Tables

#### `repositories`

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `github_url` (Text)
- `branch` (Text)
- `encrypted_access_token` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `report_configurations`

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `repository_id` (UUID, Foreign Key to repositories)
- `schedule` (Text) - Cron expression
- `webhook_url` (Text)
- `enabled` (Boolean) - Whether the configuration is active
- `last_run_at` (Timestamp, Nullable)
- `last_run_status` (Text, Nullable)
- `last_run_content` (Text, Nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Setup Instructions

### Prerequisites

- Node.js 18+ and PNPM
- Supabase account and project
- OpenAI API key
- GitHub Personal Access Token (for testing)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd git-report
pnpm install
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your Supabase Dashboard → **SQL Editor**
3. Copy the contents of `database/init.sql` and run it in the SQL Editor
4. This will create the required tables, indexes, RLS policies, and triggers

**Alternative manual setup:**
If you prefer to run the SQL manually, here are the commands:

```sql
-- Create repositories table
CREATE TABLE repositories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_url TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  encrypted_access_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report_configurations table
CREATE TABLE report_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  schedule TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT,
  last_run_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own repositories" ON repositories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own report configurations" ON report_configurations
  FOR ALL USING (auth.uid() = user_id);
```

For detailed setup instructions, see `database/README.md`.

### 3. Environment Configuration

#### Backend API (`apps/api/.env`)

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Encryption (Generate a 32-character string)
PAT_ENCRYPTION_KEY=your_32_character_encryption_key

# Server
PORT=3003

# CORS
FRONTEND_URL=http://localhost:3000
```

**Where to get these keys:**

1. **SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY**:

   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and service_role key (⚠️ Keep service_role key secret!)

2. **OPENAI_API_KEY**:

   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key (starts with `sk-`)

3. **PAT_ENCRYPTION_KEY**:
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('base64').substring(0, 32))"`

#### Frontend Web (`apps/web/.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003
```

### 4. Development

Start both applications in development mode:

```bash
# Start both API and Web in development mode
pnpm dev

# Or start individually
pnpm --filter api dev
pnpm --filter web dev
```

The API will be available at `http://localhost:3003` and the web app at `http://localhost:3000`.

### 5. Production Build

```bash
# Build all applications
pnpm build

# Start in production mode
pnpm start
```

## API Endpoints

### Authentication

- `GET /auth/me` - Get current user information

### Repositories

- `GET /repositories` - List user's repositories
- `POST /repositories` - Add a new repository
- `DELETE /repositories/:id` - Delete a repository

### Report Configurations

- `GET /report-configurations` - List user's report configurations
- `POST /report-configurations` - Create a new report configuration
- `GET /report-configurations/:id` - Get a specific configuration
- `PUT /report-configurations/:id` - Update a configuration
- `DELETE /report-configurations/:id` - Delete a configuration
- `POST /report-configurations/:id/test` - Test webhook for a configuration

## Usage

1. **Sign Up/Sign In**: Create an account or sign in to the dashboard
2. **Add Repository**: Connect a GitHub repository with a Personal Access Token
3. **Configure Reports**: Set up automated reports with schedule and webhook URL
4. **Test Webhooks**: Use the test feature to verify your webhook endpoint works
5. **Receive Reports**: AI-generated summaries will be sent to your webhook endpoint

## Documentation

- **[Webhook Testing & Date Range Logic](docs/WEBHOOK_TESTING.md)** - Comprehensive guide to webhook testing and how date ranges work
- **[Webhook Testing Example](examples/webhook-test-example.md)** - Step-by-step example of testing webhooks end-to-end
- **[Tools README](tools/README.md)** - Information about the webhook test server and other development tools

## Security Features

- **Encrypted PATs**: GitHub Personal Access Tokens are encrypted using AES-256-GCM
- **JWT Authentication**: Secure API access with Supabase JWT tokens
- **Row Level Security**: Database-level security policies
- **Input Validation**: Comprehensive request validation with class-validator

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
