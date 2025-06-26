import type { Metadata } from "next";
// Temporarily disable Google Fonts for ngrok testing
// import { Inter } from "next/font/google";
import "./globals.css";

// Temporarily use system fonts for development with ngrok
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LangAI - Master Your English Proficiency Exams",
  description:
    "Stop practicing alone. Get instant, realistic conversation practice and detailed feedback to boost your confidence and score higher on IELTS & TOEFL speaking tests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter" style={{ fontFamily: "Inter, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
