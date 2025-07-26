# IELTSpeak Copilot Instructions

## Project Overview
IELTSpeak is an AI-powered IELTS Speaking coach built with Next.js 15, using Supabase for auth/database, Vapi for voice conversations, and Polar for subscriptions. The app simulates realistic IELTS speaking exams with real-time AI feedback.

## Architecture & Key Concepts

### Core Session Flow
1. **Level Selection** (`/levels`) → **Session** (`/levels/[sessionId]`) → **Results** (`/results/[sessionId]`)
2. Sessions use Vapi for voice interaction with custom hooks managing state
3. Real-time suggestions powered by Gemini API during conversations
4. Post-session analysis generates IELTS scoring and feedback

### Database Schema (Supabase)
- **profiles**: User data with `is_premium` flag and `polar_customer_id`
- **sessions**: Practice session records with IELTS ratings as JSONB
- **subscriptions**: Polar subscription data with status tracking
- Uses RLS policies - always check user permissions in API routes

### Session State Management
Sessions use a constellation of custom hooks in `hooks/sessions/`:
- `useVapi`: Core voice interaction, manages global Vapi instance
- `useSessionTimer`: Tracks session duration
- `useSuggestions`: Real-time Gemini-powered response suggestions
- `useMessages`: Conversation transcript management
- `useSessionRating`: Post-session analysis and scoring

## Development Patterns

### API Route Structure
```
/api/subscriptions/create-checkout - Polar checkout creation
/api/customer-portal - Customer portal access
/api/webhooks/polar - Subscription webhook handler
/api/user-sessions - Session CRUD with premium checks
/api/results/[sessionId] - Session analysis and scoring
```

### Premium Feature Gating
Always use `checkUserPremiumStatus()` from `lib/polar/subscription-helpers.ts` - it handles both active subscriptions and cancelled-but-valid-until-period-end cases.

### Vapi Integration
- Global singleton pattern: `useVapi` manages single instance across components
- Assistant configuration in `lib/utils.ts` with dynamic prompts based on user level
- Call status enum: `INACTIVE → CONNECTING → ACTIVE → FINISHED`

### Subscription Flow (Polar)
1. Checkout creation via `/api/subscriptions/create-checkout`
2. Webhook handling at `/api/webhooks/polar` for subscription events
3. Database sync with `upsertSubscription()` function
4. Customer portal access through `createCustomerSession()`

## Key File Locations

### Session Components
- `app/(main-app)/levels/[sessionId]/page.tsx` - Main session interface
- `components/session/` - All session UI components (desktop/mobile variants)

### Type Definitions
- `types/sessionTypes.ts` - CallStatus enum, message interfaces
- `types/schemas.ts` - Form validation schemas with Zod

### Environment Variables
Critical: `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `VAPI_API_KEY`, `GEMINI_API_KEY`

### Database Operations
- `lib/polar/subscription-helpers.ts` - All subscription-related DB functions
- `lib/supabase/` - Client creation utilities for server/client contexts

## Development Commands
```bash
npm run dev --turbopack  # Development with Turbopack
npm run build            # Production build
```

## Common Gotchas
- Vapi instance must be singleton - check `useVapi` implementation before modifying
- Premium checks need both subscription status AND period validity
- Session IDs are UUIDs - validate format in API routes
- Polar webhook events require proper signature validation
- Mobile/desktop session components have separate implementations

## Testing Session Flow
1. Create session at `/levels` → select band → generates UUID sessionId
2. Session page loads with level parameter from URL search params
3. Vapi initializes with assistant config based on user level and profile
4. End session triggers results analysis and redirect to `/results/[sessionId]`
