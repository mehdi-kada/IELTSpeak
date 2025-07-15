This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## IELTSpeak - AI IELTS Speaking Practice Platform

IELTSpeak provides AI-powered IELTS speaking practice with real-time feedback and personalized coaching.

### 🆕 Recent Improvements

This codebase has been enhanced with modern best practices including:

- **Comprehensive Error Handling**: Centralized logging and error management
- **Type Safety**: Enhanced TypeScript implementation with proper validation
- **Security**: Input validation, XSS prevention, and secure authentication
- **Performance**: Optimized database queries and React components
- **Developer Experience**: Better tooling, utilities, and documentation

For detailed information about improvements, see [README-IMPROVEMENTS.md](./README-IMPROVEMENTS.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

Copy `.env.example` to `.env.local` and configure your API keys:

```bash
cp .env.example .env.local
```

See [README-IMPROVEMENTS.md](./README-IMPROVEMENTS.md) for detailed setup instructions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
