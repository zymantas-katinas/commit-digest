# Git Report API

This is the NestJS API for the Git Report application.

## Deployment on Vercel

This API is configured to be deployed as a separate project on Vercel using serverless functions.

### Setup Instructions

1. **Create a new Vercel project** for the API:

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Set the **Root Directory** to `apps/api`

2. **Configure Build Settings**:

   - **Framework Preset**: Other
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run vercel-build` (or leave empty, it will use the default)
   - **Output Directory**: Leave empty (Vercel will handle this)
   - **Install Command**: `npm install` (or leave empty for auto-detection)

3. **Environment Variables**:
   Set the following environment variables in your Vercel project settings:

   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   PAT_ENCRYPTION_KEY=your_pat_encryption_key
   FRONTEND_URL=your_frontend_url
   NODE_ENV=production
   ```

4. **Deploy**:
   - Click "Deploy" and Vercel will build and deploy your API
   - Your API will be available at `https://your-project-name.vercel.app`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

### API Endpoints

The API will be available at your Vercel domain. All routes from your NestJS application will be accessible under the root path.

### Troubleshooting

1. **Build Errors**: Make sure all dependencies are listed in `package.json`
2. **Runtime Errors**: Check the Vercel function logs in the dashboard
3. **CORS Issues**: Update the CORS configuration in `main.ts` if needed
4. **Environment Variables**: Ensure all required environment variables are set in Vercel

### Files Structure

- `vercel.json` - Vercel deployment configuration
- `api/index.js` - Serverless function entry point
- `.vercelignore` - Files to exclude from deployment
- `package.json` - Dependencies and build scripts
