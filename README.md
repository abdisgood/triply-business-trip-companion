# Triply - Business Trip Companion

A comprehensive web application for managing business trips to China (and other destinations) with AI-powered features, team collaboration, and advanced trip planning capabilities.

## 🚀 Features

### Core Trip Management
- **Trip Creation & Planning**: Create detailed business trips with objectives, budgets, and timelines
- **Team Collaboration**: Invite team members to collaborate on trips with real-time updates
- **Company Database**: Maintain detailed profiles of companies to visit
- **Itinerary Management**: Organize meetings, schedule visits, and track trip progress

### AI-Powered Features
- **Company Data Enrichment**: Automatically enhance company profiles with AI (5 credits)
- **Smart Company Suggestions**: Generate relevant company lists based on trip objectives (7 credits)
- **Intelligent Itinerary Planning**: AI-optimized meeting schedules and route planning (10 credits)
- **Receipt OCR Processing**: Extract expense data from receipt photos (3 credits)
- **Expense Categorization**: AI-powered expense analysis and reporting (2 credits)

### Location & Mapping
- **Google Maps Integration**: Geocoding, route optimization, and location services
- **Route Optimization**: Find the most efficient paths between company visits
- **Nearby Services**: Discover hotels, restaurants, and services near companies
- **Travel Time Calculation**: Accurate duration estimates between locations

### Calendar Integration
- **Google Calendar Sync**: Seamlessly integrate with your existing calendar
- **Meeting Scheduling**: Automated calendar event creation for company visits
- **Conflict Detection**: Identify scheduling conflicts and suggest alternatives
- **Team Calendar Coordination**: Sync schedules across team members

### Expense Management
- **Smart Receipt Processing**: AI-powered receipt scanning and data extraction
- **Real-time Expense Tracking**: Track spending against trip budgets
- **Category Management**: Automatic expense categorization
- **Expense Analytics**: Detailed spending reports and insights
- **Multi-currency Support**: Handle expenses in different currencies

### Export & Reporting
- **Trip Reports**: Generate comprehensive trip summaries
- **Expense Reports**: Export expense data in multiple formats (PDF, Excel, CSV)
- **Itinerary Export**: Share detailed itineraries with stakeholders
- **Analytics Dashboard**: Visual insights into trip performance and spending

### Booking Integration
- **Hotel Booking Links**: Direct integration with major booking platforms
- **Flight Booking**: Links to airline and travel booking services
- **Ground Transportation**: Recommendations for local transport options
- **Partner Platform Integration**: Seamless booking through partner websites

## 🛠 Technology Stack

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for modern, responsive design
- **React Router** for client-side routing
- **Date-fns** for date manipulation
- **Recharts** for data visualization

### Backend Services
- **Firebase** for authentication, database, and file storage
- **OpenAI API** for AI-powered features
- **Google Maps API** for location services
- **Google Calendar API** for calendar integration

### Key Libraries
- **React Beautiful DnD** for drag-and-drop interfaces
- **React Dropzone** for file uploads
- **React-to-Print** for report generation
- **ExcelJS** for Excel file generation
- **jsPDF** for PDF generation

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- OpenAI API key (for AI features)
- Google Cloud project with Maps and Calendar APIs enabled

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd triply
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys in `.env.local` (see CONFIGURATION.md for details)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

Detailed configuration instructions are available in [CONFIGURATION.md](./CONFIGURATION.md), including:

- Firebase setup and configuration
- OpenAI API key setup
- Google Maps and Calendar API configuration
- Security considerations for production deployment

## 📱 Usage

### Creating Your First Trip

1. **Sign in** with your Google account
2. **Click "New Trip"** on the dashboard
3. **Fill in trip details**: destination, dates, objectives, budget
4. **Use AI suggestions** to get relevant companies (optional)
5. **Invite team members** to collaborate
6. **Add companies** to your itinerary
7. **Schedule meetings** and optimize routes

### Managing Expenses

1. **Take photos** of receipts during your trip
2. **Upload receipts** - AI will extract data automatically
3. **Review and categorize** expenses
4. **Track spending** against your budget
5. **Generate reports** for reimbursement

### Team Collaboration

1. **Invite team members** when creating a trip
2. **Share real-time updates** on itinerary changes
3. **Coordinate calendars** to avoid conflicts
4. **Collaborate on company research** and meeting notes

## 🎯 AI Credits System

The application uses a credit system for AI-powered features:

- **Company Enrichment**: 5 credits per company
- **Trip Objectives Analysis**: 7 credits per analysis
- **Itinerary Planning**: 10 credits per optimization
- **Receipt OCR**: 3 credits per receipt
- **Expense Analysis**: 2 credits per analysis

New users start with 100 credits. Additional credits can be purchased through the application.

## 🔒 Security & Privacy

- **Secure Authentication** with Google OAuth
- **Data Encryption** at rest and in transit
- **API Key Protection** with domain restrictions
- **User Data Isolation** - users only access their own data
- **GDPR Compliant** data handling

## 🌟 Upcoming Features

- **Mobile App** with React Native
- **Offline Capabilities** for areas with poor connectivity
- **Advanced Analytics** with machine learning insights
- **Integration APIs** for enterprise systems
- **Multi-language Support** for international teams
- **Automated Booking** through partner APIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check [CONFIGURATION.md](./CONFIGURATION.md) for setup help
- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🙏 Acknowledgments

- **Material-UI** for the excellent component library
- **Firebase** for robust backend services
- **OpenAI** for powerful AI capabilities
- **Google** for Maps and Calendar APIs
- **React community** for continuous innovation

---

**Built with ❤️ for business travelers and international teams** 