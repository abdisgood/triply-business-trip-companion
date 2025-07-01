# Triply Configuration Guide

This document outlines how to configure the enhanced Triply application with all necessary API keys and services.

## Required API Keys and Services

### 1. Firebase (Required)
- **Purpose**: Authentication, database, and file storage
- **Setup**:
  1. Go to [Firebase Console](https://console.firebase.google.com/)
  2. Create a new project or use existing one
  3. Enable Authentication (Google provider)
  4. Create Firestore database
  5. Enable Storage
  6. Copy configuration from Project Settings

```bash
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 2. OpenAI API (For AI Features)
- **Purpose**: Company enrichment, itinerary planning, expense OCR, trip suggestions
- **Setup**:
  1. Sign up at [OpenAI Platform](https://platform.openai.com/)
  2. Create API key
  3. Add credits to your account

```bash
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: In production, OpenAI API calls should go through your backend server for security.

### 3. Google Maps API (For Location Features)
- **Purpose**: Geocoding, route optimization, location search, map display
- **Setup**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Enable Google Maps JavaScript API, Places API, Geocoding API
  3. Create API key
  4. Restrict API key to your domain

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 4. Google Calendar API (For Calendar Integration)
- **Purpose**: Meeting scheduling, calendar sync, conflict detection
- **Setup**:
  1. In Google Cloud Console, enable Calendar API
  2. Create API key (restricted to Calendar API)
  3. Create OAuth 2.0 client ID with these origins:
     - `http://localhost:3000`
     - `http://127.0.0.1:3000`
     - `https://yourdomain.com` (for production)
  4. Add redirect URIs:
     - `http://localhost:3000`
     - `http://localhost:3000/auth/callback`
     - Production URLs when deploying
  5. Configure OAuth consent screen with calendar scope

```bash
REACT_APP_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Detailed Setup Guide**: See `GOOGLE_CALENDAR_SETUP.md` for complete instructions.

## Environment File Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all the API keys and configuration values
3. Restart the development server

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
npm start
```

## Feature Dependencies

### Core Features (Always Available)
- Trip creation and management
- Company database
- Basic expense tracking
- Team collaboration

### AI-Powered Features (Requires OpenAI API)
- Company data enrichment (5 credits)
- Trip objective analysis (7 credits)
- Itinerary planning (10 credits)
- Receipt OCR processing (3 credits)
- Expense categorization (2 credits)

### Location Features (Requires Google Maps API)
- Address geocoding
- Route optimization
- Company location mapping
- Hotel/restaurant finder
- Travel time calculation

### Calendar Features (Requires Google Calendar API)
- Meeting scheduling
- Calendar integration
- Conflict detection
- Automatic event creation

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use environment variables** in production
3. **Implement backend proxy** for sensitive API calls
4. **Restrict API keys** to specific domains/IPs
5. **Monitor API usage** and set billing alerts

## Cost Considerations

### OpenAI API
- GPT-4: ~$0.03 per 1K tokens
- GPT-4 Vision: ~$0.01 per image
- Estimated cost per AI operation: $0.05-$0.20

### Google Maps API
- Geocoding: $5 per 1K requests
- Places API: $17 per 1K requests
- Maps JavaScript API: $7 per 1K loads

### Firebase
- Free tier available
- Pay-as-you-use pricing
- Firestore: $0.18 per 100K reads

## Development vs Production

### Development
- Use API keys directly in environment variables
- Enable CORS for development domains
- Use Firebase Auth domain for localhost

### Production
- Implement backend API proxy
- Use server-side API keys
- Implement rate limiting
- Add proper error handling
- Use production Firebase project

## Troubleshooting

### Firebase Issues
- Check project settings
- Verify authentication providers
- Ensure Firestore rules allow read/write

### OpenAI Issues
- Verify API key is valid
- Check billing/usage limits
- Ensure model access permissions

### Google Maps Issues
- Verify APIs are enabled
- Check API key restrictions
- Ensure billing is set up

### Calendar Issues
- Verify OAuth consent screen
- Check client ID configuration
- Ensure Calendar API is enabled

## Support

For configuration issues:
1. Check this documentation
2. Verify API key validity
3. Check browser console for errors
4. Review network requests in DevTools

For feature requests or bugs, please create an issue in the project repository. 