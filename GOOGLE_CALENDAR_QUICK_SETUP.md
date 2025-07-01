# Quick Google Calendar Setup - Immediate Steps

Based on your current Google Cloud Console OAuth screen, here's what you need to do RIGHT NOW:

## ✅ Current Screen: OAuth Client ID Setup

### Authorized JavaScript Origins
Click "Add URI" and add these one by one:
```
http://localhost:3000
http://127.0.0.1:3000
```

### Authorized Redirect URIs  
Click "Add URI" and add these one by one:
```
http://localhost:3000
http://localhost:3000/auth/callback
http://127.0.0.1:3000
http://127.0.0.1:3000/auth/callback
```

### After Adding URIs:
1. Click **"CREATE"** button
2. **COPY the Client ID** that appears (starts with numbers, ends with `.apps.googleusercontent.com`)
3. Save it - you'll need it for your `.env` file

## ✅ Next Steps (After Creating OAuth Client):

### 1. Enable Calendar API
1. Go to **"APIs & Services" > "Library"**  
2. Search **"Google Calendar API"**
3. Click it and press **"ENABLE"**

### 2. Create API Key
1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS" > "API key"**
3. **Copy the API key**
4. Click **"RESTRICT KEY"**
5. Under **"API restrictions"** → Select **"Google Calendar API"**
6. Under **"Application restrictions"** → Choose **"HTTP referrers"**
7. Add: `http://localhost:3000/*` and `http://127.0.0.1:3000/*`
8. Click **"SAVE"**

### 3. Configure OAuth Consent Screen
1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"**
3. Fill in:
   - **App name**: Triply
   - **User support email**: Your email
   - **Developer contact**: Your email
4. In **"Scopes"** → Add: `https://www.googleapis.com/auth/calendar`
5. In **"Test users"** → Add your email address
6. **SAVE & CONTINUE**

### 4. Create .env File
Create a `.env` file in your project root:
```env
REACT_APP_GOOGLE_CALENDAR_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here

# Also add other required keys:
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_OPENAI_API_KEY=your_openai_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 5. Test It
```bash
npm start
```
Then try creating a trip with calendar integration!

## 🚨 Important Notes

- **Don't skip the OAuth Consent Screen** - your app won't work without it
- **Add your email as a test user** while in development
- **The Calendar API must be enabled** before testing
- **Keep your API keys secure** - never commit them to git

## 🆘 If You Get Stuck

Common error solutions:
- **"Access blocked"** → Check OAuth consent screen setup
- **"Invalid origin"** → Verify JavaScript origins are exact
- **"API not enabled"** → Enable Google Calendar API in Library
- **"Invalid API key"** → Check key restrictions and regenerate if needed

---

📋 **Current Progress Checklist:**
- [ ] Add JavaScript origins to OAuth client
- [ ] Add redirect URIs to OAuth client  
- [ ] Create OAuth client and copy Client ID
- [ ] Enable Google Calendar API
- [ ] Create and restrict API key
- [ ] Configure OAuth consent screen
- [ ] Add calendar scope and test users
- [ ] Create .env file with keys
- [ ] Test the integration

Complete these steps and your Google Calendar integration will be ready! 🎉 