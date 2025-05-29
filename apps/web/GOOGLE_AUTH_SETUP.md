# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your CommitDigest application.

## Prerequisites

- A Google Cloud Console account
- Access to your Supabase project dashboard

## Step 1: Google Cloud Console Setup

### 1.1 Create or Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make note of your project ID

### 1.2 Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application" as the application type
4. Give it a meaningful name (e.g., "CommitDigest Web App")
5. In "Authorized JavaScript origins", add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. In "Authorized redirect URIs", add the Supabase callback URL (see step 2.3)
7. Click "Create"
8. Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Supabase Configuration

### 2.1 Access Authentication Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" > "Providers"

### 2.2 Enable Google Provider

1. Find "Google" in the list of providers
2. Toggle it to "Enabled"

### 2.3 Configure Google Provider

1. Enter the **Client ID** from Google Cloud Console
2. Enter the **Client Secret** from Google Cloud Console
3. Copy the **Redirect URL** provided by Supabase (it looks like: `https://your-project.supabase.co/auth/v1/callback`)
4. Click "Save"

### 2.4 Update Google Cloud Console Redirect URIs

1. Go back to Google Cloud Console > "APIs & Services" > "Credentials"
2. Edit your OAuth 2.0 Client ID
3. Add the Supabase redirect URL to "Authorized redirect URIs"
4. Click "Save"

## Step 3: Environment Configuration

Your application is already configured to use Google authentication. No additional environment variables are required since Supabase handles the OAuth flow.

## Step 4: Testing

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After successful authentication, you'll be redirected back to your application

## Troubleshooting

### Common Issues:

1. **"Error 400: redirect_uri_mismatch"**

   - Ensure the redirect URI in Google Cloud Console exactly matches the one from Supabase
   - Check for trailing slashes or protocol differences (http vs https)

2. **"Google sign-in failed"**

   - Verify that Google+ API is enabled in Google Cloud Console
   - Check that your Google OAuth credentials are correctly entered in Supabase
   - Ensure your domain is added to authorized origins

3. **Popup blocked or doesn't open**
   - The OAuth flow opens in the same window by default
   - If using popup mode, ensure popups are allowed for your domain

### Testing in Development:

- Make sure `http://localhost:3000` is added to authorized origins in Google Cloud Console
- Use `http://` (not `https://`) for localhost development

### Production Deployment:

- Add your production domain to authorized origins
- Use `https://` for production domains
- Update redirect URIs to use your production domain

## Security Notes

- Keep your Google Client Secret secure and never expose it in frontend code
- Supabase handles the secure storage and exchange of OAuth tokens
- Users authenticated via Google will have their email and basic profile information available in Supabase
- Consider implementing additional authorization checks in your application logic

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
