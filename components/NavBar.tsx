"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUserImage } from "@/hooks/supabase/use-current-user-image";
import { useCurrentUserName } from "@/hooks/supabase/use-current-user-name";
import { CurrentUserAvatar } from "./user-avatar";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import { ContactModal } from "./ContactModal";

function NavBar() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const userAvatar = useCurrentUserImage();
  const userName = useCurrentUserName();
  const path = usePathname();
  return (
    <>
      <nav className="bg-[#374151]/70 backdrop-blur-md p-3 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="hidden  md:block text-xl font-bold text-[#E91E63]">
              IELTSpeak
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center  sm:gap-15 gap-8 absolute sm:right-1/2 sm:transform sm:translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-gray-200 text-sm sm:text-lg  hover:text-[#E91E63] font-medium transition-colors duration-300",
                  {
                    "text-[#E91E63]": path === item.href,
                  }
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* User Profile Section */}
          <div
            className="relative"
            onMouseEnter={() => setIsProfileMenuOpen(true)}
            onMouseLeave={() => setIsProfileMenuOpen(false)}
          >
            {/* Profile Button */}
            <button className="flex items-center space-x-3 focus:outline-none">
              {userAvatar ? (
                <CurrentUserAvatar />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#374151] shadow-md border-2 border-[#E91E63] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            <div
              className={`absolute top-full right-0 mt-3 w-48 bg-[#374151] border border-white/10 rounded-lg shadow-xl z-50 transition-all duration-200 ${
                isProfileMenuOpen
                  ? "opacity-100 visible "
                  : "opacity-0 invisible"
              }`}
            >
              <div className="p-1">
                <Link
                  href="/profile"
                  className="block w-full text-left px-4 py-2 text-gray-300 rounded-md hover:bg-[#E91E63]/20 transition-colors duration-300"
                >
                  My Profile
                </Link>

                <button
                  onClick={() => setShowContactModal(true)}
                  className="block w-full text-left px-4 py-2 text-gray-300 rounded-md hover:bg-[#E91E63]/20 transition-colors duration-300"
                >
                  Contact
                </button>

                <div className="border-t border-gray-600 my-1"></div>
                <LogoutButton
                  className={
                    "block w-full text-left px-4 py-2 text-red-400 rounded-md hover:bg-[#E91E63]/20 transition-colors duration-300"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}

export default NavBar;
