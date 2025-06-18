# CommitDigest - AI-Powered Git Commit Reporting

**🌐 Visit at [commigdigest.com](https://commigdigest.com)**

An automated Git commit reporting tool that uses AI to generate intelligent summaries of repository activity and delivers them via webhooks or email notifications.

## ✨ Features

- **🔗 Easy Repository Connection**: Connect GitHub repositories with Personal Access Tokens
- **🤖 AI-Powered Summaries**: Uses OpenAI GPT-4o Mini to generate intelligent commit summaries
- **⏰ Automated Scheduling**: Configure daily or weekly reports with smart date range detection
- **🔄 Enable/Disable Reports**: Toggle report configurations on/off without deleting them
- **🧪 Webhook Testing**: Manual webhook testing with detailed feedback and commit analysis
- **📨 Flexible Delivery**: Send reports to webhook endpoints or email notifications
- **🔒 Secure Storage**: Encrypted storage of GitHub Personal Access Tokens
- **💻 Modern Dashboard**: Beautiful web interface built with Next.js

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and PNPM
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd git-report
pnpm install
```

### 2. Setup Environment

Create `.env` files in both `apps/api/` and `apps/web/` directories using the provided `.env.example` templates.

**Backend (`apps/api/.env`):**

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
PAT_ENCRYPTION_KEY=your_32_character_encryption_key
PORT=3003
FRONTEND_URL=http://localhost:3000
```

**Frontend (`apps/web/.env.local`):**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003
```

### 3. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script from `database/init.sql` in your Supabase SQL Editor

### 4. Start Development

```bash
pnpm dev
```

Visit `http://localhost:3000` to access the dashboard.

## 🏗️ Tech Stack

- **Backend**: Nest.js, TypeScript, Supabase, OpenAI
- **Frontend**: Next.js 14, Shadcn/ui, Tailwind CSS
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
git-report/
├── apps/
│   ├── api/          # Nest.js backend API
│   └── web/          # Next.js frontend
├── database/         # SQL migrations and schema
└── package.json      # Root package.json
```

## 🎯 How to Use

1. **Sign Up**: Create an account at the dashboard
2. **Add Repository**: Connect your GitHub repository with a Personal Access Token
3. **Configure Reports**: Set up automated reports with schedule and delivery method
4. **Test Setup**: Use the test feature to verify everything works
5. **Receive Reports**: Get AI-generated commit summaries automatically

## 🔑 Key Environment Variables

| Variable                    | Description               | Where to Get                                            |
| --------------------------- | ------------------------- | ------------------------------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL | Supabase Dashboard → Settings → API                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key          | Supabase Dashboard → Settings → API                     |
| `OPENAI_API_KEY`            | OpenAI API key            | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `PAT_ENCRYPTION_KEY`        | 32-char encryption key    | Generate with: `openssl rand -base64 32 \| head -c 32`  |

## 📊 Database Schema

The application uses the following main tables:

- **`repositories`**: Stores GitHub repository connections
- **`report_configurations`**: Manages automated report settings
- **`report_runs`**: Tracks report execution history
- **`user_profiles`**: User settings and preferences

See `database/init.sql` for the complete schema.

## 🔒 Security Features

- **Encrypted Storage**: GitHub tokens encrypted with AES-256-GCM
- **JWT Authentication**: Secure API access with Supabase
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive request validation

## 📝 License

This project is licensed under the MIT License.

---

**Need help?** Check out our [documentation](docs/) or visit [commigdigest.com](https://commigdigest.com) for more information.
