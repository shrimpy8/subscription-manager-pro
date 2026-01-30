# Subscription Manager Pro

A comprehensive subscription management application built with Next.js, TypeScript, and Tailwind CSS. Track your AI tool subscriptions, discover trending tools, and manage your subscription portfolio with advanced filtering and analytics.

![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Subscription Manager Pro](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)

## 🚀 Features

### 📊 Subscription Management
- **Comprehensive Tracking**: Monitor all your AI tool subscriptions in one place
- **Advanced Filtering**: Filter by category, status, billing cycle, priority, and more
- **Multiple View Modes**: Grid, list, and analytics views for different use cases
- **Smart Sorting**: Sort by name, cost, renewal date, and other criteria
- **Status Management**: Track active, paused, and canceled subscriptions

### 🤖 AI Tools Discovery
- **Trending AI Tools**: Browse the top 50 Gen AI consumer apps with a16z rankings
- **Advanced Categorization**: Filter by AI tool categories and subcategories
- **Real-time Filtering**: Find tools by ranking, tracking status, and visibility
- **One-click Subscription**: Add AI tools directly to your subscription list

### 📈 Analytics & Insights
- **Cost Tracking**: Monitor monthly subscription costs and trends
- **Renewal Alerts**: Get notified about upcoming renewals
- **Usage Analytics**: Track subscription usage patterns
- **Export Capabilities**: Export data to CSV for external analysis

### 🛠 Data Management
- **Import/Export**: Backup and restore your subscription data
- **Local Storage**: Secure local data persistence
- **Data Validation**: Comprehensive input validation and error handling
- **CSV Export**: Export subscription data with proper formatting

## 🏗 Technology Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - UI library with latest features
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### Key Dependencies
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **date-fns** - Date manipulation utilities
- **Recharts** - Data visualization

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
subscription-manager-pro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   └── subscriptions/ # Subscription CRUD operations
│   │   ├── ai-tool-form/      # AI tool subscription form
│   │   ├── ai-tools/          # AI tools discovery pages
│   │   ├── settings/          # Settings page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main dashboard
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ai-tools-browser.tsx
│   │   ├── sidebar.tsx
│   │   ├── subscriptions-table.tsx
│   │   └── ...               # Other components
│   ├── lib/                  # Utility libraries
│   │   ├── ai-tools-data.ts  # AI tools data management
│   │   ├── subscription-persistence.ts
│   │   ├── utils.ts          # General utilities
│   │   └── ...               # Other utilities
│   ├── types/                # TypeScript type definitions
│   │   ├── subscription.ts   # Subscription data types
│   │   └── ai-tools.ts       # AI tools data types
│   └── utils/                # Utility functions
│       ├── error-handler.ts  # Error handling utilities
│       └── validation.ts     # Form validation
├── public/                   # Static assets
│   └── toolsSubscription.json # AI tools data
├── memory-bank/             # Project documentation and context
│   ├── projectbrief.md      # Project overview and scope
│   ├── productContext.md    # Product context and user needs
│   ├── systemPatterns.md    # Architecture and design patterns
│   ├── techContext.md       # Technology stack and setup
│   ├── activeContext.md     # Current development status
│   └── progress.md          # Feature completion tracking
├── package.json              # Dependencies and scripts
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager
- **Docker Desktop** (required for local Supabase)
- Supabase CLI (installed automatically via npx)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shrimpy8/subscription-manager-pro.git
   cd subscription-manager-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```

   Update the `.env.local` file with the following values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
   ```

   > **Note**: The anon key above is for local development only. For production, use your actual Supabase project credentials.

4. **Start Docker Desktop**

   Make sure Docker Desktop is running before proceeding. You can verify by running:
   ```bash
   docker ps
   ```

5. **Start the local Supabase instance**
   ```bash
   npx supabase start
   ```

   Wait for all containers to start. You should see output like:
   ```
   Started supabase local development setup.

   API URL: http://127.0.0.1:54321
   Studio URL: http://127.0.0.1:54323
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   ```

   > **Troubleshooting**: If you see a port conflict error, stop any existing Supabase containers:
   > ```bash
   > docker stop $(docker ps -q --filter "name=supabase")
   > npx supabase start
   > ```

6. **Initialize the database (first time only)**

   If this is your first time setting up, you need to seed the database with initial data:
   ```bash
   # Connect to the database and run the seed file
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f complete_data_insert.sql
   ```

   Or use Supabase Studio at http://127.0.0.1:54323 to run SQL queries manually.

7. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Quick Start (After Initial Setup)

Once you've completed the initial setup, you only need to run these commands:

```bash
# 1. Start Docker Desktop (if not running)

# 2. Start Supabase
npx supabase start

# 3. Start the app
npm run dev
```

### Stopping the Application

```bash
# Stop the Next.js dev server
Ctrl+C

# Stop Supabase containers (optional - to free resources)
npx supabase stop
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run dev:3001` - Start development server on port 3001
- `npm run dev:4000` - Start development server on port 4000
- `npm run dev:8080` - Start development server on port 8080
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 📱 Pages & Features

### 🏠 Dashboard (`/`)
- **Subscription Overview**: View all subscriptions with filtering and sorting
- **Statistics Cards**: Monthly cost, active subscriptions, expiring soon
- **Multiple View Modes**: Grid, list, and analytics views
- **Advanced Filters**: Category, status, billing cycle, priority filtering

### 🤖 AI Tools Browser (`/ai-tools`)
- **Trending Tools**: Browse top 50 Gen AI consumer apps
- **a16z Rankings**: View tools ranked by a16z analysis
- **Category Filtering**: Filter by AI tool categories and subcategories
- **One-click Subscription**: Add tools directly to your subscription list

### ➕ Add Subscription (`/add-subscription`)
- **Comprehensive Form**: Add new subscriptions with detailed information
- **AI Tool Integration**: Pre-populate data from AI tools browser
- **Validation**: Real-time form validation and error handling
- **Custom Fields**: Support for custom categories and notes

### ⚙️ Settings (`/settings`)
- **Data Management**: Import/export subscription data
- **Application Info**: Version information and feature overview
- **Usage Statistics**: View subscription statistics and analytics
- **Data Backup**: Clear all data with confirmation

### 🔧 AI Tool Categorizer (`/ai-tools/categorizer`)
- **Tool Categorization**: Categorize AI tools by type and purpose
- **URL Analysis**: Extract tool information from URLs
- **Batch Processing**: Process multiple tools at once

## 🔌 API Endpoints

### Subscriptions API (`/api/subscriptions`)

#### GET `/api/subscriptions`
- **Description**: Retrieve all subscriptions
- **Response**: Array of subscription objects

#### POST `/api/subscriptions`
- **Description**: Create a new subscription
- **Body**: Subscription object
- **Response**: Created subscription object

#### GET `/api/subscriptions/[id]`
- **Description**: Retrieve a specific subscription
- **Parameters**: `id` - Subscription ID
- **Response**: Subscription object

#### PUT `/api/subscriptions/[id]`
- **Description**: Update a specific subscription
- **Parameters**: `id` - Subscription ID
- **Body**: Updated subscription object
- **Response**: Updated subscription object

#### DELETE `/api/subscriptions/[id]`
- **Description**: Delete a specific subscription
- **Parameters**: `id` - Subscription ID
- **Response**: Success message

#### POST `/api/subscriptions/[id]/actions`
- **Description**: Perform actions on subscriptions (pause, resume, etc.)
- **Parameters**: `id` - Subscription ID
- **Body**: Action object with type and parameters

#### GET `/api/subscriptions/export`
- **Description**: Export subscriptions to CSV
- **Response**: CSV file download

## 🎨 Design System

### Color Palette
- **Primary**: Orange gradient (`from-orange-500 to-amber-500`)
- **Secondary**: Amber and yellow tones
- **Background**: Light gradient (`from-orange-50 to-amber-50`)
- **Text**: Gray scale with proper contrast ratios

### Typography
- **Headings**: Bold, gradient text for emphasis
- **Body**: Clean, readable font stack
- **Code**: Monospace for technical content

### Components
- **Cards**: Glass-morphism effect with subtle shadows
- **Buttons**: Consistent styling with hover states
- **Forms**: Clean, accessible form controls
- **Modals**: Overlay modals with backdrop blur

## 🔒 Data Security

- **Local Storage**: All data stored locally in browser
- **No External APIs**: No data sent to external services
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Graceful error handling and user feedback
- **No Hardcoded Credentials**: All API credentials use environment variables
- **Zero npm Vulnerabilities**: Regular dependency audits and updates
- **Secure Supabase Integration**: Proper environment variable validation and error handling

## 📚 Project Documentation

The project includes comprehensive documentation in the `memory-bank/` folder:

- **`projectbrief.md`**: Project overview, features, and technical architecture
- **`productContext.md`**: Product context, user needs, and value propositions
- **`systemPatterns.md`**: System architecture patterns and design decisions
- **`techContext.md`**: Technology stack, development environment, and configuration
- **`activeContext.md`**: Current development status and recent activity
- **`progress.md`**: Feature completion tracking and project status

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Form Validation**: Real-time validation using Zod schemas
- **Error Boundaries**: React error boundaries for graceful failures
- **Input Sanitization**: All user inputs are sanitized
- **Type Safety**: Full TypeScript coverage for type safety

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use the established design system
- Write comprehensive error handling
- Add proper JSDoc documentation
- Test all functionality before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **a16z** for the Gen AI consumer apps ranking data
- **shadcn/ui** for the beautiful component library
- **Lucide** for the comprehensive icon set
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/shrimpy8/subscription-manager-pro/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🔮 Roadmap

### Upcoming Features
- [x] **Database Integration**: Supabase integration (completed)
- [ ] **User Authentication**: Multi-user support with authentication
- [ ] **Advanced Analytics**: Charts and graphs for subscription insights
- [ ] **Mobile App**: React Native mobile application
- [ ] **API Integrations**: Direct integration with subscription services
- [ ] **Notifications**: Email and push notifications for renewals
- [ ] **Team Collaboration**: Share subscriptions with team members

### Performance Improvements
- [ ] **Code Splitting**: Lazy loading for better performance
- [ ] **Caching**: Implement caching strategies
- [ ] **PWA Support**: Progressive Web App capabilities
- [ ] **Offline Support**: Work offline with data synchronization

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**