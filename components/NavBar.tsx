"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUserImage } from "@/hooks/use-current-user-image";
import { useCurrentUserName } from "@/hooks/use-current-user-name";
import { CurrentUserAvatar } from "./user-avatar";
import { usePathname } from "next/navigation";
import { navItems } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";
import { ContactModal } from "./ContactModal";
import ProfileDropDown from "./ProfileDropDown";

function NavBar() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userAvatar = useCurrentUserImage();
  const userName = useCurrentUserName();
  const path = usePathname();
  return (
    <>
      <nav className="bg-[#2F2F7F]/70 backdrop-blur-md p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <span className="hidden  md:block text-xl font-bold text-red-600">
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
                  "text-gray-200 text-sm sm:text-lg  hover:text-[#E62136] font-medium transition-colors duration-300",
                  {
                    "text-[#E62136]": path === item.href,
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
                <div className="h-10 w-10 rounded-full bg-blue-900/50 border-2 border-[#E62136] flex items-center justify-center">
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
            <ProfileDropDown isProfileMenuOpen={isProfileMenuOpen} />
          </div>
          {/* Contact Modal - Move outside the dropdown */}
        </div>
      </nav>
    </>
  );
}

export default NavBar;
