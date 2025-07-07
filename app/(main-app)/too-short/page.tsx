export const metadata: Metadata = {
  title: "Short Conversation",
  description:
    "Upgrade to IELTSpeak Premium for unlimited practice sessions, advanced AI feedback, and full access to all features. Choose the plan that fits your learning goals and boost your IELTS speaking score.",
};

import ConversationTooShort from "@/components/ConversationTooShort";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

function page() {
  return (
    <div className="flex  sm:justify-center  h-screen">
      <ConversationTooShort />
    </div>
  );
}

export default page;
