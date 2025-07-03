import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "www.ieltspeak.com";

// filepath: app/layout.js (or app/page.js)
export const metadata: Metadata = {
  title: {
    default: "IELTSpeak | AI IELTS Speaking Practice & Mock Tests",
    template: "%s - IELTSpeak",
  },
  metadataBase: new URL("https://your-domain.com"),
  description:
    "Get instant feedback on your IELTS Speaking with the IELTSpeak AI examiner. Practice with realistic mock tests, improve your fluency, and boost your band score.",
  keywords: [
    "IELTS Speaking",
    "IELTS Speaking practice",
    "AI IELTS tutor",
    "IELTS mock test",
    "IELTS band score",
    "speaking practice app",
    "AI English tutor",
    "IELTS",
  ],
  openGraph: {
    title: "IELTSpeak | AI IELTS Speaking Practice & Mock Tests",
    description:
      "Practice with a realistic AI examiner and get instant feedback to boost your IELTS band score.",
    url: siteUrl,
    siteName: "IELTSpeak",
    images: [
      {
        url: "/app/opengraph-image.png", // Place your social sharing image in the `public` folder
        width: 1200,
        height: 630,
        alt: "IELTSpeak AI Examiner Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IELTSpeak | AI IELTS Speaking Practice & Mock Tests",
    description:
      "Practice with a realistic AI examiner and get instant feedback to boost your IELTS band score.",
    images: ["/app/opengraph-image.png"], // Twitter uses the same image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
