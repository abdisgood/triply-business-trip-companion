# Triply - Your Ultimate Business Trip Companion

![Triply Logo](https://via.placeholder.com/800x200/d32f2f/ffffff?text=Triply+-+Business+Trip+Companion)

Triply is a comprehensive web application designed to help business professionals prepare, organize, and execute successful business trips. Manage companies, contacts, schedules, and travel itineraries all in one beautiful, intuitive platform.

## 🚀 Key Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration**: Sign in securely with your Google account
- **User-specific Data**: All your data is private and secure to your account
- **Session Management**: Persistent login with automatic session handling

### 🏢 **Advanced Company Management**
- **Rich Company Profiles**: Comprehensive company information with rich text notes
- **Smart Status Tracking**: Track companies through your business relationship journey
  - New Lead → Interested → Contacted → Scheduled → Visited → Partnership
- **Location Intelligence**: Enhanced address management with country/city dropdowns and GPS coordinates
- **Contact Integration**: Manage multiple contacts per company with detailed information
- **Tag System**: Organize companies with predefined and custom tags

### 📝 **Enhanced Company Form**
- **Multi-step Wizard**: Intuitive 3-step form for comprehensive data entry
- **Rich Text Editor**: Add detailed notes with formatting using Quill.js
- **Phone Number Validation**: International phone number formatting with country codes
- **Location Autocomplete**: Smart address entry with map integration support
- **Embedded Contact Management**: Add contacts directly within the company form
- **Action Scheduling**: Schedule meetings, calls, and follow-ups during company creation

### 📊 **Smart Dashboard & Analytics**
- **Visual Statistics**: Company count, status distribution, and pipeline metrics
- **Advanced Search**: Multi-field search across names, industries, locations, and tags
- **Dynamic Filtering**: Filter by status, tags, and custom criteria
- **Real-time Updates**: Live data synchronization across all views

### 📱 **Modern User Interface**
- **Material-UI 5**: Beautiful, responsive design with custom Triply theme
- **Gradient Design**: Professional red and gold color scheme
- **Interactive Cards**: Hover effects, smooth animations, and engaging micro-interactions
- **Mobile Responsive**: Perfect experience on desktop, tablet, and mobile devices
- **Dark Mode Ready**: Theme system prepared for dark mode implementation

### 👥 **Contact Management**
- **Multiple Contacts per Company**: Store unlimited contacts for each company
- **Contact Details**: Names, positions, emails, phones, and personal notes
- **Primary Contact Designation**: Mark key contacts for quick reference
- **Contact History**: Track all interactions and communications

### 📅 **Intelligent Scheduling**
- **Action Types**: Visits, calls, meetings, emails, follow-ups, and research tasks
- **Date Management**: Advanced date picker with calendar integration
- **Priority Levels**: High, medium, and low priority action management
- **Status Tracking**: Pending, completed, and cancelled action states
- **Reminder System**: Never miss important business opportunities

### 🏷️ **Smart Tagging System**
- **Predefined Tags**: Industry-specific tags for quick categorization
- **Custom Tags**: Create your own tags for personalized organization
- **Tag Autocomplete**: Existing tag suggestions for consistent tagging
- **Tag Analytics**: Track your most used tags and categories

### 🌐 **Global Business Support**
- **International Focus**: Built specifically for international business relationships
- **Country Management**: Comprehensive country selection with proper formatting
- **Multi-language Ready**: Architecture supports multiple languages
- **Currency Support**: Ready for multi-currency business data

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Material-UI 5**: Complete UI component library with custom theming
- **React Router 6**: Client-side routing with protected routes
- **Day.js**: Lightweight date manipulation and formatting
- **React Quill**: Rich text editor for detailed notes
- **React Phone Input**: International phone number handling
- **Country List**: Comprehensive country data management

### Backend & Database
- **Firebase Firestore**: Real-time NoSQL database with offline support
- **Firebase Auth**: Secure authentication with Google OAuth
- **Security Rules**: User-specific data access and validation
- **Real-time Sync**: Live data updates across all user sessions

### Development Tools
- **Create React App**: Zero-configuration development environment
- **ESLint**: Code quality and consistency checking
- **Modern JavaScript**: ES6+ features and async/await patterns

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Firebase project with Authentication and Firestore enabled
- Google OAuth configured in Firebase Console

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd triply
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```

5. **Open browser**
   - Navigate to `http://localhost:3000`
   - Sign in with your Google account
   - Start adding companies and planning your business trips!

## 🎯 Usage Guide

### Getting Started
1. **Sign In**: Use your Google account to securely access Triply
2. **Dashboard Overview**: View your company statistics and recent activity
3. **Add Your First Company**: Click the floating action button to get started

### Adding Companies
1. **Basic Information**: Company name, industry, status, and description
2. **Location & Contact**: Address details, phone, email, and website
3. **Additional Details**: Rich text notes, contacts, and scheduled actions

### Managing Your Pipeline
- **Status Updates**: Move companies through your business relationship stages
- **Search & Filter**: Find companies quickly using multiple criteria
- **Bulk Operations**: Manage multiple companies efficiently

### Planning Business Trips
- **Schedule Actions**: Plan visits, meetings, and calls in advance
- **Contact Management**: Access key contacts for each company
- **Location Planning**: Use address data for trip route planning
- **Notes & History**: Review all interaction history before meetings

## 🔧 Configuration Options

### Firebase Security Rules
Ensure your Firestore has proper security rules for user data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    match /contacts/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    // Similar rules for other collections
  }
}
```

### Google Maps Integration
To enable map features, add your Google Maps API key to the public/index.html:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
```

## 📱 Mobile Experience

Triply is fully responsive and provides an excellent mobile experience:
- **Touch-friendly Interface**: Large touch targets and intuitive gestures
- **Optimized Layouts**: Responsive design adapts to all screen sizes
- **Offline Capabilities**: Core functionality available without internet
- **Fast Loading**: Optimized performance for mobile networks

## 🔒 Security & Privacy

- **User Data Isolation**: Each user's data is completely separate and secure
- **Firebase Security Rules**: Server-side validation and access control
- **HTTPS Encryption**: All data transmission is encrypted
- **Google OAuth**: Secure authentication without password management
- **Data Ownership**: You own and control all your business data

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Other Platforms
The build folder can be deployed to any static hosting service like Netlify, Vercel, or AWS S3.

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for any API changes
- Ensure mobile responsiveness for UI changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, feature requests, or questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

---

**Start planning better business trips with Triply today!** 🚀✈️

*Built with ❤️ for business professionals who value organization and efficiency.* 