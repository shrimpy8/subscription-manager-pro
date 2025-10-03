# Project Brief: Subscription Manager Pro

## Project Overview
Subscription Manager Pro is a comprehensive Next.js application that combines subscription management with AI tools discovery. It's built as a modern web application using Next.js 15.5.3, TypeScript, and Tailwind CSS, featuring a sophisticated UI with shadcn/ui components.

## Core Purpose
The application serves two main functions:
1. **Subscription Management**: Track and manage personal/business subscriptions with advanced filtering, analytics, and cost tracking
2. **AI Tools Discovery**: Browse and discover trending AI tools from a curated list of 50 Gen AI consumer apps with a16z rankings

## Key Features

### Subscription Management
- **Comprehensive Tracking**: Monitor subscriptions with detailed metadata (cost, billing cycle, renewal dates, priority, usage frequency)
- **Advanced Filtering**: Multi-dimensional filtering by category, status, billing cycle, priority, usage frequency, cost range
- **Multiple View Modes**: Grid, list, and analytics views for different use cases
- **Smart Analytics**: Cost tracking, renewal alerts, usage analytics, productivity insights
- **Data Management**: Import/export capabilities, local storage persistence, CSV export

### AI Tools Integration
- **Trending AI Tools**: Browse top 50 Gen AI consumer apps with a16z rankings
- **Category Organization**: 21 AI tool categories (Chat, Search, Image, Video, etc.)
- **One-click Subscription**: Add AI tools directly to subscription tracking
- **Advanced Categorization**: Filter by AI tool categories and subcategories

## Technical Architecture

### Frontend Stack
- **Next.js 15.5.3**: App Router with TypeScript
- **React 19.1.0**: Latest React features
- **TypeScript 5.0**: Full type safety
- **Tailwind CSS 3.4.17**: Utility-first styling
- **shadcn/ui**: Modern component library with Radix UI primitives

### Key Dependencies
- **Lucide React**: Icon library
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **date-fns**: Date manipulation
- **Recharts**: Data visualization

### Data Management
- **Local Storage**: All data persisted locally in browser
- **TypeScript Interfaces**: Comprehensive type definitions
- **Centralized Utilities**: Date handling, validation, formatting
- **Error Handling**: Comprehensive error boundaries and validation

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes for CRUD operations
│   ├── ai-tools/          # AI tools discovery pages
│   ├── settings/          # Settings and data management
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ai-tools-browser.tsx
│   ├── subscriptions-table.tsx
│   └── ...               # Other components
├── lib/                  # Utility libraries
│   ├── utils.ts          # Centralized utilities
│   ├── subscription-storage.ts
│   └── ai-tools-data.ts
├── types/                # TypeScript definitions
│   ├── subscription.ts
│   └── ai-tools.ts
└── utils/                # Utility functions
    ├── error-handler.ts
    └── validation.ts
```

## Development Philosophy
- **Type Safety**: Full TypeScript coverage with comprehensive interfaces
- **Centralized Utilities**: All common operations centralized in lib/utils.ts
- **Error Handling**: Comprehensive error boundaries and user feedback
- **User Experience**: Modern, responsive design with accessibility considerations
- **Data Integrity**: Input validation, sanitization, and proper error handling

## Current Status
The project is a fully functional subscription management application with AI tools integration. It includes:
- Complete subscription CRUD operations
- Advanced filtering and search capabilities
- AI tools browser with categorization
- Data import/export functionality
- Responsive design with modern UI components
- Comprehensive error handling and validation

## Future Roadmap
- Database integration (Supabase/PostgreSQL)
- User authentication and multi-user support
- Advanced analytics with charts and graphs
- Mobile app development
- API integrations with subscription services
- Team collaboration features
