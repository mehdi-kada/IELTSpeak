// app/not-found.tsx
import Link from "next/link"; // Changed from lucide-react to next/link
import React from "react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#1a1a3a]">
      {" "}
      {/* Added background */}
      <h1 className="text-9xl font-black text-[#2F2F7F] relative">
        404
        <span
          className="absolute top-0 left-0 w-full h-full text-[#E62136] opacity-70"
          style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }} // Fixed style prop
        >
          404
        </span>
      </h1>
      <div className="mt-4">
        <h2 className="text-4xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-400 mt-2 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have{" "}
          {/* Fixed typo */}
          been moved or deleted.
        </p>
      </div>
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="bg-[#E62136] hover:shadow-md hover:shadow-[#E62136]/30 hover:-translate-y-px text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
