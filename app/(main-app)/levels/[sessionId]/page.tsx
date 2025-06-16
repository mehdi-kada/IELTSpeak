import Session from "@/components/session";

import React from "react";

interface PageProps {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    level?: string;
  }>;
}

async function ActualSession({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { level } = await searchParams;
  console.log("search params : ", level);
  return (
    <>
      <div>
        <Session sessionID={sessionId} level={level || "B1"} />
      </div>
    </>
  );
}

export default ActualSession;
