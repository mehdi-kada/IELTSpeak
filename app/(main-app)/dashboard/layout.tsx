// app/(main-app)/dashboard/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your IELTS speaking practice progress and performance analytics",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
