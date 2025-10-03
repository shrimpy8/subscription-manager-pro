# Technical Context: Subscription Manager Pro

## Technology Stack

### Core Framework
- **Next.js 15.5.3**: React framework with App Router
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5.0**: Full type safety and modern language features
- **Node.js**: Runtime environment (18.0+ recommended)

### Styling & UI
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **shadcn/ui**: Modern component library with Radix UI primitives
- **Lucide React**: Comprehensive icon library
- **tailwindcss-animate**: Animation utilities

### Form Handling & Validation
- **React Hook Form 7.62.0**: Form state management
- **Zod 4.1.8**: Schema validation
- **@hookform/resolvers**: Form validation integration

### Data & Utilities
- **date-fns 4.1.0**: Date manipulation utilities
- **Recharts 3.2.0**: Data visualization
- **clsx**: Conditional class name utility
- **tailwind-merge**: Tailwind class merging

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **TypeScript**: Type checking

## Project Structure

### Next.js App Router Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── subscriptions/ # CRUD operations
│   ├── ai-tools/          # AI tools pages
│   ├── settings/          # Settings page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ai-tools-browser.tsx
│   ├── subscriptions-table.tsx
│   └── ...               # Feature components
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

### Component Architecture
```
components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── [feature]-modal.tsx    # Modal components
├── [feature]-table.tsx    # Table components
├── [feature]-browser.tsx  # Browser components
└── sidebar.tsx           # Navigation
```

## Development Environment

### Prerequisites
- **Node.js**: 18.0 or later
- **npm**: Package manager
- **Git**: Version control

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/subscription-manager-pro.git
cd subscription-manager-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```json
{
  "dev": "next dev --turbopack",
  "dev:3001": "next dev --turbopack --port 3001",
  "dev:4000": "next dev --turbopack --port 4000",
  "dev:8080": "next dev --turbopack --port 8080",
  "build": "next build --turbopack",
  "start": "next start",
  "lint": "eslint"
}
```

## Configuration Files

### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

export default nextConfig
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        // ... additional color definitions
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

## Data Management

### Local Storage Strategy
```typescript
// lib/subscription-storage.ts
const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscription-manager-subscriptions',
  FILTERS: 'subscription-manager-filters',
  VIEW_MODE: 'subscription-manager-view-mode',
  URL_STATE: 'subscription-manager-url-state'
} as const;
```

**Benefits**:
- **Privacy**: No external data sharing
- **Performance**: Fast local access
- **Offline**: Works without internet connection
- **Simplicity**: No database setup required

**Limitations**:
- **Single Device**: Data tied to specific browser
- **Storage Limits**: Browser storage constraints
- **Backup**: Manual export/import required

### Type Safety
```typescript
// types/subscription.ts
export interface Subscription {
  id: string;
  name: string;
  cost: number;
  // ... comprehensive type definitions
}
```

**Benefits**:
- **Compile-time Safety**: Catch errors before runtime
- **IDE Support**: Better autocomplete and navigation
- **Refactoring**: Safe code changes
- **Documentation**: Types serve as documentation

## Performance Considerations

### Code Splitting
```typescript
// Lazy loading for better performance
const AIToolsBrowser = lazy(() => import('@/components/ai-tools-browser'));
```

### Bundle Optimization
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load components on demand
- **Image Optimization**: Next.js automatic image optimization
- **CSS Optimization**: Tailwind CSS purging

### Caching Strategy
- **Local Storage**: Client-side data persistence
- **Browser Caching**: Static asset caching
- **Component Memoization**: React.memo for expensive components
- **Debounced Operations**: Optimized search and filtering

## Security Considerations

### Input Validation
```typescript
// utils/validation.ts
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### XSS Prevention
- **Input Sanitization**: Remove HTML tags
- **Output Encoding**: Proper text rendering
- **Content Security Policy**: Browser security headers

### Data Privacy
- **Local Storage Only**: No external data transmission
- **No Analytics**: No user tracking
- **No Cookies**: No persistent tracking
- **Open Source**: Transparent codebase

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Other Platforms
- **Netlify**: Static site hosting
- **AWS Amplify**: AWS hosting
- **Railway**: Container hosting
- **DigitalOcean**: VPS hosting

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_APP_NAME=Subscription Manager Pro
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Development Workflow

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type checking
- **Prettier**: Code formatting (if configured)
- **Git Hooks**: Pre-commit validation

### Testing Strategy
- **Unit Tests**: Component testing (future)
- **Integration Tests**: Feature testing (future)
- **E2E Tests**: User flow testing (future)
- **Manual Testing**: Current primary testing method

### Error Handling
```typescript
// utils/error-handler.ts
export function handleSubscriptionError(
  error: Error,
  context: string,
  metadata?: Record<string, unknown>
): void {
  console.error(`Error in ${context}:`, error, metadata);
  // Additional error handling logic
}
```

## Future Technical Considerations

### Database Integration
- **Supabase**: PostgreSQL with real-time features
- **PostgreSQL**: Relational database
- **MongoDB**: Document database
- **SQLite**: Local database

### Authentication
- **NextAuth.js**: Authentication framework
- **Supabase Auth**: Built-in authentication
- **Auth0**: Third-party authentication
- **Custom Auth**: Custom authentication system

### API Integration
- **REST APIs**: Standard REST endpoints
- **GraphQL**: Query language for APIs
- **WebSocket**: Real-time communication
- **Server-Sent Events**: Real-time updates
