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

function NavBar() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const logoSrc = "/images/logo2.png"; // Set to "/images/logo.png" to test your logo
  const userAvatar = useCurrentUserImage();
  const userName = useCurrentUserName();
  const path = usePathname();

  return (
    <nav className="bg-[#2F2F7F] border-b border-white/10 p-4 shadow-lg rounded-xl">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt="ToIELIT Logo"
              width={60}
              height={60}
              className="h-10 w-10"
            />
          ) : (
            <svg
              className="h-8 w-8 text-[#E62136]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          )}
          <span className="hidden  md:block text-xl font-bold text-white">
            ToIELIT
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-gray-300 hover:text-[#E62136] font-medium transition-colors duration-300",
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
              <div className="h-10 w-10 rounded-full bg-gray-700 border-2 border-[#E62136] flex items-center justify-center">
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
            className={`absolute top-full right-0 mt-3 w-48 bg-[#2a2a68] border border-white/10 rounded-lg shadow-xl z-50 transition-all duration-200 ${
              isProfileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            <div className="p-1">
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-2 text-gray-300 rounded-md hover:bg-[#E62136]/20 transition-colors duration-300"
              >
                My Profile
              </Link>
              <Link
                href="/settings"
                className="block w-full text-left px-4 py-2 text-gray-300 rounded-md hover:bg-[#E62136]/20 transition-colors duration-300"
              >
                Settings
              </Link>
              <div className="border-t border-gray-600 my-1"></div>
              <LogoutButton
                className={
                  "block w-full text-left px-4 py-2 text-red-400 rounded-md hover:bg-[#E62136]/20 transition-colors duration-300"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
