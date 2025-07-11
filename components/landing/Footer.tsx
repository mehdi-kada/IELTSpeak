"use client";

import React, { useState } from "react";
import { ContactModal } from "@/components/ContactModal";
import Link from "next/link";

const Footer = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <>
      <footer className="bg-[#101030] bg-opacity-30  py-8 px-5">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 IELTSpeak. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <button
              onClick={() => setShowContactModal(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
            <Link
              className="hover:text-white transition-colors cursor-pointe"
              href={"/privacy"}
            >
              Privacy Policies
            </Link>
            <Link
              className="hover:text-white transition-colors cursor-pointe"
              href={"/terms"}
            >
              Terms Of Service
            </Link>
          </div>
        </div>
      </footer>

      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </>
  );
};

export default Footer;
