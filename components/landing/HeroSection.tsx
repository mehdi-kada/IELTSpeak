import Link from "next/link";
import React from "react";

const HeroSection = () => {
  return (
    <section className="hero-bg min-h-screen flex items-center justify-center text-center p-5 pt-20">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight gradient-text">
            Ace IELTS & TOEFL Speaking with Your Personal AI Tutor
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Stop practicing alone. Get instant, realistic conversation practice
            and detailed feedback to boost your confidence and score higher.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/subscribe"
              className="cta-button text-white font-bold py-4 px-8 rounded-lg w-full sm:w-auto"
            >
              Start Your Free Trial
            </Link>
            <a
              href="#features"
              className="secondary-button border-2 font-bold py-3.5 px-8 rounded-lg w-full sm:w-auto"
            >
              Explore Features
            </a>
          </div>
        </div>
        {/* Mockup/Visual Element */}
        <div className="mt-16 relative">
          <div className="mx-auto w-full max-w-3xl h-64 bg-gray-900/30 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl shadow-indigo-900/50 backdrop-blur-sm">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
              <p className="mt-2 text-gray-300">
                "Tell me about a time you had to learn a new skill."
              </p>
              <div className="mt-4 flex justify-center items-center space-x-4">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-gray-400">AI is listening...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
