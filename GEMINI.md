# GEMINI.md - IELTSpeak Project

## Project Overview

This is a full-stack web application called **IELTSpeak**, designed as an AI-powered coach for the IELTS Speaking test. The application provides a realistic simulation of the exam, offering detailed performance analysis and personalized feedback to help users improve their scores.

The project is a **monorepo** managed with **pnpm workspaces**.

**Key Technologies:**

*   **Framework:** Next.js (with Turbopack)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with shadcn/ui components
*   **Database & Auth:** Supabase
*   **AI & Machine Learning:**
    *   **Conversation:** Vapi
    *   **Analysis & Suggestions:** Google Gemini API
*   **Payments:** Polar
*   **Email:** Resend
*   **Analytics:** PostHog
*   **Deployment:** Vercel

**Architecture:**

The application follows a server-first architecture, with a Next.js frontend and a backend powered by various services, including Supabase for the database and authentication, and external APIs for AI features. The database schema is defined in `schema.sql` and includes tables for user profiles, sessions, and subscriptions.

## Building and Running

The project uses `pnpm` as the package manager. The following scripts are defined in `package.json`:

*   **`pnpm dev`**: Starts the development server with Turbopack.
*   **`pnpm build`**: Creates a production build of the application.
*   **`pnpm start`**: Starts the production server.
*   **`pnpm lint`**: Lints the codebase using Next.js's built-in ESLint configuration.

**To run the project locally:**

1.  Install dependencies: `pnpm install`
2.  Set up your environment variables in a `.env.local` file.
3.  Run the development server: `pnpm dev`

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling, with a set of predefined UI components in `components/ui`. The `tailwind.config.js` file contains the theme configuration.
*   **Components:** Components are organized in the `components` directory, with a clear separation between UI components and feature-specific components.
*   **State Management:** The application uses a combination of React hooks and Supabase for state management.
*   **Routing:** The application uses the Next.js App Router, with routes defined in the `app` directory.
*   **Database:** The database schema is defined in `schema.sql`. Any changes to the database should be reflected in this file.
*   **Middleware:** The `middleware.ts` file handles session updates for authentication.
*   **Monorepo:** The project is a monorepo, with dependencies managed by pnpm workspaces. The `pnpm-workspace.yaml` file defines the workspace configuration.
