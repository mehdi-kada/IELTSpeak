import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#101030] bg-opacity-30  py-8 px-5">
      <div className="container mx-auto text-center text-gray-400">
        <p>&copy; 2025 IELTSpeak. All rights reserved.</p>
        <div className="flex justify-center space-x-6 mt-4">
          <a
            href="mailto:mehdikada64@gmail.com?subject=IELTSpeak Contact&body=Hello, I would like to get in touch regarding IELTSpeak."
            className="hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
