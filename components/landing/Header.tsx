import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="absolute top-0 left-0 w-full z-10 p-5">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-600">IELTSpeak</h1>
        <Link href={"/dashboard"} className="cta-button text-white font-semibold py-2 px-6 rounded-lg text-sm">
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Header;
