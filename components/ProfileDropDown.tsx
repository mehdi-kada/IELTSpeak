import Link from "next/link";
import React, { useState } from "react";
import { LogoutButton } from "./logout-button";
import { ContactModal } from "./ContactModal";

function ProfileDropDown({
  isProfileMenuOpen,
}: {
  isProfileMenuOpen: boolean;
}) {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <>
      <div
        className={`absolute top-full right-0 mt-3 w-48 bg-[#2a2a68] border  border-white/10 rounded-lg shadow-xl z-50 transition-all duration-200 ${
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

          <button
            onClick={() => setShowContactModal(true)}
            className="block w-full text-left px-4 py-2 text-gray-300 rounded-md hover:bg-[#E62136]/20 transition-colors duration-300"
          >
            Contact
          </button>

          <div className="border-t border-gray-600 my-1"></div>
          <LogoutButton
            className={
              "block w-full text-left px-4 py-2 text-red-400 rounded-md hover:bg-[#E62136]/20 transition-colors duration-300"
            }
          />
        </div>
      </div>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
}

export default ProfileDropDown;
