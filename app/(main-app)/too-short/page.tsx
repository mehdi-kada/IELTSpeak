import ConversationTooShort from "@/components/ConversationTooShort";
import Link from "next/link";
import React from "react";

function page() {
  return (
    <div className="flex justify-center items-center h-screen">

      <ConversationTooShort />
    </div>
  );
}

export default page;
