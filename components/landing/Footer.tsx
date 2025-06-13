import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#101030] bg-opacity-30  py-8 px-5">
      <div className="container mx-auto text-center text-gray-400">
        <p>&copy; 2024 LangAI. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a href="#" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-white">
            Terms of Service
          </a>
          <a href="#" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
