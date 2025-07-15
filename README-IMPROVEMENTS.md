# IELTSpeak - AI IELTS Speaking Practice Platform

IELTSpeak is a Next.js application that provides AI-powered IELTS speaking practice using advanced voice recognition and feedback systems.

## 🚀 Features

- **AI-Powered Speaking Practice**: Realistic IELTS speaking tests with AI examiner
- **Real-time Voice Analysis**: Instant feedback on fluency, grammar, vocabulary, and pronunciation
- **Personalized Practice**: Customized questions based on user profile and target band score
- **Progress Tracking**: Comprehensive dashboard with session history and improvement metrics
- **Multiple Band Levels**: Support for IELTS band scores 6.5 to 9.0
- **Subscription Management**: Premium features with LemonSqueezy integration

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**: 
  - Google Gemini AI for evaluation
  - VAPI AI for voice interactions
  - ElevenLabs for text-to-speech
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript with Zod validation
- **Analytics**: PostHog
- **Error Monitoring**: Sentry
- **Payments**: LemonSqueezy

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google AI API key
- VAPI AI account
- ElevenLabs API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mehdi-kada/IELTSpeak.git
   cd IELTSpeak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys and configuration values in `.env.local`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── levels/            # Speaking practice levels
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── session/          # Session-related components
│   └── landing/          # Landing page components
├── lib/                   # Utility libraries
│   ├── actions.ts        # Server actions
│   ├── logger.ts         # Centralized logging
│   ├── validation.ts     # Input validation schemas
│   ├── error-handling.ts # Error handling utilities
│   └── supabase/         # Supabase configuration
├── hooks/                 # Custom React hooks
├── constants/             # Application constants
└── types/                 # TypeScript type definitions
```

## 🔐 Environment Variables

Required environment variables (see `.env.example` for complete list):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI
GOOGLE_API_KEY=your_google_api_key

# VAPI AI
VAPI_API_KEY=your_vapi_api_key

# LemonSqueezy
LEMONSQUEEZY_API_KEY=your_lemonsqueezy_api_key
```

## 🧪 Development Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 Key Improvements Made

### 1. **Error Handling & Logging**
- ✅ Centralized logging system with structured logs
- ✅ Comprehensive error handling across API routes
- ✅ React error boundaries for better user experience
- ✅ Consistent error response formats

### 2. **Security Enhancements**
- ✅ Input validation using Zod schemas
- ✅ Environment variable validation
- ✅ Improved authentication checks
- ✅ XSS prevention utilities

### 3. **Code Organization**
- ✅ Extracted hardcoded constants
- ✅ Modular function architecture
- ✅ Consistent naming conventions
- ✅ Enhanced TypeScript interfaces

### 4. **Performance & UX**
- ✅ Optimized database queries
- ✅ Enhanced loading states
- ✅ Custom async hooks
- ✅ Skeleton loaders

### 5. **Type Safety**
- ✅ Comprehensive type guards
- ✅ Proper API response typing
- ✅ Validation schemas
- ✅ Utility type functions

## 🔧 Code Quality Features

### Centralized Logging
```typescript
import { logger } from '@/lib/logger';

logger.info('User session started', { userId, level });
logger.error('Database error', error, { context });
```

### Error Handling
```typescript
import { AppError, createErrorResponse } from '@/lib/error-handling';

throw new AppError('Invalid input', 400, 'VALIDATION_ERROR');
```

### Input Validation
```typescript
import { levelSchema } from '@/lib/validation';

const validatedLevel = levelSchema.parse(level);
```

### Async Operations
```typescript
import { useAsync } from '@/hooks/useAsync';

const { data, loading, error, execute } = useAsync(fetchUserData);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes following the established patterns
4. Ensure TypeScript compilation: `npx tsc --noEmit`
5. Test your changes thoroughly
6. Submit a pull request

## 📦 Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on commits to main branch

## 🐛 Common Issues

### Build Failures
- Ensure all environment variables are set
- Check TypeScript compilation: `npx tsc --noEmit`
- Verify Supabase connection

### Authentication Issues
- Verify Supabase URL and keys
- Check middleware configuration
- Ensure proper redirect URLs

## 📚 API Documentation

### Authentication
All protected routes require valid Supabase session.

### Key Endpoints
- `POST /api/rating/[sessionId]` - Submit session for AI evaluation
- `GET /api/user-sessions` - Get user session history
- `POST /api/subscriptions` - Handle subscription webhooks

## 🔒 Security Considerations

- All API inputs are validated using Zod schemas
- Database queries use parameterized statements
- User authentication required for protected routes
- Error messages sanitized for production
- Environment variables properly secured

## 📊 Monitoring

- **Logging**: Structured logs with context
- **Error Tracking**: Sentry integration
- **Analytics**: PostHog integration
- **Performance**: Next.js built-in analytics

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review error logs for specific issues
3. Submit an issue on GitHub with detailed information

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.