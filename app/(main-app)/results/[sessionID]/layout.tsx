import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Test Results",
  description:
    "Review your detailed IELTS speaking test results, including your estimated band score, performance analysis, and personalized AI feedback from IELTSpeak.",
  openGraph: {
    title: "My IELTS Speaking Test Results | IELTSpeak",
    description:
      "Review detailed feedback and band scores from a practice session on IELTSpeak.",
    url: "www.ieltspeak.com", // Point to the main site URL as these pages shouldn't be indexed
    siteName: "IELTSpeak",
    images: [
      {
        url: "/app/opengraph-image.png", // A unique image showing the results UI
        width: 1200,
        height: 630,
        alt: "A summary of IELTS speaking test results on IELTSpeak",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "My IELTS Speaking Test Results | IELTSpeak",
    description:
      "Review detailed feedback and band scores from a practice session on IELTSpeak.",
    images: ["/app/opengraph-image.png"],
  },

  // we dont want google to index every single result page
  robots: {
    index: false,
    follow: false,
  },
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
