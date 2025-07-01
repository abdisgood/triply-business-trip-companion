# Google Calendar API Setup Guide

## Prerequisites
- Google Cloud Platform account
- Project created in Google Cloud Console
- Billing enabled (for API usage)

## Step 1: Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create a new one)
3. Navigate to **"APIs & Services" > "Library"**
4. Search for **"Google Calendar API"**
5. Click on it and press **"Enable"**

## Step 2: Create API Key

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**
4. Copy the generated API key
5. Click **"Restrict Key"** (recommended)
6. Under **"API restrictions"**, select **"Restrict key"**
7. Choose **"Google Calendar API"** from the dropdown
8. Under **"Application restrictions"**, choose **"HTTP referrers"**
9. Add these referrers:
   ```
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   https://yourdomain.com/*
   ```
10. Click **"Save"**

## Step 3: Create OAuth 2.0 Client ID

1. In **"Credentials"**, click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth client ID"**
3. Choose **"Web application"**
4. Name it **"Triply-Web"**
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   https://yourdomain.com
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   http://127.0.0.1:3000
   http://127.0.0.1:3000/auth/callback
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```
7. Click **"Create"**
8. Copy the **Client ID** (you'll need this)

## Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account)
3. Fill in required information:
   - **App name**: Triply
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add **Scopes**:
   - Click **"Add or Remove Scopes"**
   - Search and add: `https://www.googleapis.com/auth/calendar`
   - This allows read/write access to user's calendar
5. Add **Test users** (while in testing mode):
   - Add your email address
   - Add any other emails you want to test with
6. Click **"Save and Continue"**

## Step 5: Environment Variables

Create or update your `.env` file in the project root:

```env
# Google Calendar API Configuration
REACT_APP_GOOGLE_CALENDAR_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here

# Example:
# REACT_APP_GOOGLE_CALENDAR_API_KEY=AIzaSyBvOkBo0qpNlv_abc123def456ghi789
# REACT_APP_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

## Step 6: Install Required Dependencies

The app already includes the required dependencies. If you need to install them manually:

```bash
npm install gapi-script
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm start
   ```

2. Navigate to your app in the browser
3. Try to create a trip with calendar integration
4. You should see a Google sign-in popup
5. Grant calendar permissions
6. Test creating a calendar event

## Step 8: Production Deployment

When deploying to production:

1. Update your OAuth client with production URLs
2. Update environment variables on your hosting platform
3. Ensure your domain is verified in Google Search Console
4. Submit your app for verification if needed (for production use)

## Troubleshooting

### Common Issues:

1. **"Access blocked" error**:
   - Make sure OAuth consent screen is configured
   - Add your email as a test user
   - Check that scopes are properly configured

2. **"Unauthorized JavaScript origin" error**:
   - Verify the origins in OAuth client settings
   - Check that you're using the exact URL (http vs https)
   - Clear browser cache and try again

3. **"Invalid API key" error**:
   - Check that Calendar API is enabled
   - Verify API key restrictions
   - Ensure the key is correctly set in environment variables

4. **"Insufficient permissions" error**:
   - Check that calendar scope is included
   - Re-authenticate the user
   - Verify OAuth consent screen configuration

### Testing Checklist:

- [ ] Google Calendar API is enabled
- [ ] API key is created and restricted
- [ ] OAuth client ID is created with correct origins/redirects
- [ ] OAuth consent screen is configured
- [ ] Environment variables are set correctly
- [ ] App can authenticate with Google
- [ ] Calendar events can be created successfully
- [ ] Events appear in user's Google Calendar

## API Quotas and Limits

- **Queries per day**: 1,000,000 (default)
- **Queries per 100 seconds per user**: 20,000
- **Queries per 100 seconds**: 200,000

For production apps with high usage, you may need to request quota increases.

## Security Best Practices

1. **Restrict API keys** to specific APIs and domains
2. **Use HTTPS** in production
3. **Validate all user inputs** before API calls
4. **Handle errors gracefully** and don't expose sensitive information
5. **Monitor API usage** to detect anomalies
6. **Regularly rotate API keys** if compromised

## Next Steps

After setup, you can:
- Create calendar events for business meetings
- Check for scheduling conflicts
- Suggest alternative meeting times
- Create comprehensive trip calendars
- Export calendar data
- Integrate with other Google services 