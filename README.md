# IELTSpeak - AI-Powered IELTS Speaking Coach

**IELTSpeak** is a full-stack web application designed to empower students preparing for the IELTS Speaking test. With realistic AI-driven exam simulations, detailed performance analysis, and personalized feedback, it helps users build confidence and achieve their target band score.

![Session UI Screenshot](public/images/Session.png)

*The live session interface where users engage with the AI examiner.*

## ✨ Features

- **Goal-Oriented Practice**: Select your target IELTS band score for a customized test experience.
- **Realistic AI Exam Simulation**: Experience a voice-only mock test replicating all three parts of the official IELTS Speaking test, powered by an AI Examiner.
- **Dynamic AI Examiner**: Adapts question difficulty and language complexity based on your selected band score.
- **Instant, Detailed Feedback**: Receive a comprehensive score breakdown after each session, based on the four official IELTS criteria (Fluency, Lexical Resource, Grammar, Pronunciation).
- **Personalized Suggestions**: Get real-time, profile-based suggestions during sessions for natural and authentic responses.
- **Session History & Progress Tracking**: View past practice sessions and track improvement via a secure user dashboard.
- **Secure Authentication & Data Privacy**: Full user authentication and data storage with Supabase, leveraging Row Level Security for privacy.
- **Subscription-Based Access**: Monetized via Lemon Squeezy for seamless payments and subscriptions.
- **App Monitoring**: Integrated with PostHog for analytics and Sentry for real-time error tracking to ensure a reliable user experience.

## 🛠️ Tech Stack

Built with a modern, server-first architecture:

- **Framework**: [Next.js](https://nextjs.org/) 
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Conversation**: [Vapi](https://vapi.ai/)
- **AI Analysis & Suggestions**: [Google Gemini API](https://ai.google.dev/gemini-api)
- **Payments**: [Polar](https://polar.sh/)
- **Email**: [Resend](https://resend.com/)
- **Analytics**: [PostHog](https://posthog.com/)
- **Error Tracking**: [Sentry](https://sentry.io/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📸 Screenshots

Below are key interfaces of the IELTSpeak application:

| **Levels / Exam Lobby** | **Results Page** |
|-------------------------|------------------|
| ![Levels Selection UI](public/images/Bands.png) | ![Results Page UI](public/images/FeedBack.png) |

| **User Profile** |
|------------------|
| ![Profile Page UI](public/images/Profile.png) |

## 🚀 Getting Started

Follow these steps to set up **IELTSpeak** locally.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- Accounts and API keys for:
  - Supabase
  - Google Gemini
  - Vapi
  - Resend
  - Lemon Squeezy
  - PostHog
  - Sentry

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/mehdi-kada/ieltspeak.git
   cd ieltspeak
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env.local` file in the project root.
   - Copy the contents of `.env.example` or add the required variables (see below).

4. **Configure Supabase**:
   - Run the SQL script in `database/schema.sql` via the Supabase SQL Editor to set up tables and policies.
   - Configure authentication and necessary database triggers.

5. **Start the development server**:
   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### Environment Variables

Add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Vapi
VAPI_API_KEY=your_vapi_api_key

# Resend
RESEND_API_KEY=your_resend_api_key

# Polar
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID=your_monthly_product_id
NEXT_PUBLIC_POLAR_YEARLY_PRODUCT_ID=your_yearly_product_id

# PostHog
POSTHOG_API_KEY=your_posthog_api_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host

# Sentry
SENTRY_DSN=your_sentry_dsn
```

## 📄 License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.
