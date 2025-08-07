"use client";
import React, { useRef, useEffect, useState } from "react";

const FeaturesSection = () => {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Personalized Levels",
      description:
        "From 6.5 to 9, practice at a level that challenges you without being overwhelming. We adapt to your progress.",
    },

    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z"
          />
        </svg>
      ),
      title: "Realistic AI Partner",
      description:
        "Powered by advanced AI, our conversation partner provides natural, context-aware interactions for a true-to-life practice session.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: "Smart Suggestions",
      description:
        "Suggestions that know you. Instantly get words, and ideas based on your profile to keep the conversation flowing and expand your vocabulary.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Instant Score Analysis",
      description:
        "Receive an estimated IELTS score after each practice test, with detailed feedback on fluency, grammar, and vocabulary.",
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);

          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-20 px-5">
      <div className="container mx-auto" ref={sectionRef}>
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">
            Everything You Need to Succeed
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our features are designed to simulate the real exam experience and
            give you the feedback you can't get anywhere else.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-300 ease-out 
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
              `}
              style={{ transitionDelay: visible ? `${index * 250}ms` : "0ms" }}
            >
              <div className=" p-6 rounded-xl max-w-3xl mx-auto bg-[#374151] border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#E91E63]">
                <div className="text-[#E91E63] mb-4">{feature.icon}</div>
                <h4 className="font-bold text-xl mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
