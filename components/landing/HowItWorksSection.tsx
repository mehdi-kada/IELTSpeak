"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    stepsRefs.current.forEach((stepRef) => {
      if (stepRef) {
        observer.observe(stepRef);
      }
    });

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      stepNumber: "01",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
          />
        </svg>
      ),
      title: "Tell Us About Yourself",
      description:
        "Tell us a bit about your background, skill level, and goals so we can tailor your exercises, track your growth, and focus on what matters most for your IELTS success.",
      image: "/images/Profile.png",
    },
    {
      stepNumber: "02",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      ),
      title: "Start Talking",
      description:
        "Jump right into a natural conversation with our AI practice answering real IELTS style questions, build your confidence, and immerse yourself in a truly interactive speaking experience.",
      image: "/images/Session.png",
    },
    {
      stepNumber: "03",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      title: "Get Feedback",
      description:
        "Receive an instant, in-depth performance report with your estimated IELTS band score, fluency, coherence, vocabulary, and grammar ratings, plus targeted tips and next-step guidance to level up your speaking skills.",
      image: "/images/FeedBack.png",
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 px-5 bg-[#1e2733] bg-opacity-30">
      <div className="container mx-auto">
        <div ref={headerRef} className="text-center mb-12 opacity-0">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">
            Get Your Target Score in 3 Simple Steps
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start practicing in seconds. Our streamlined process gets you
            talking right away.
          </p>
        </div>
        <div className="flex flex-col space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                stepsRefs.current[index] = el;
              }}
              className={`flex items-center ${
                index % 2 === 1 ? "flex-row-reverse" : ""
              } space-x-8 opacity-0`}
              style={{
                animationDelay: `${index * 0.2}s`,
                animationFillMode: "both",
              }}
            >
              <div className="w-full hidden sm:block md:w-1/2 border border-white/20 shadow-lg shadow-[#E91E63] transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-[#E91E63]/30">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={1350}
                  height={619}
                  quality={100}
                  className="mx-auto transition-transform duration-300"
                />
              </div>
              <div className="w-full md:w-1/2 m-5">
                <div className="text-6xl font-black text-[#424c5c] opacity-50 mb-4 transition-all duration-300 hover:opacity-70">
                  {step.stepNumber}
                </div>
                <div className="flex flex-col justify-center items-center text-center">
                  <div className="text-[#E91E63] mb-4 inline-block transition-transform duration-300 hover:scale-110">
                    {step.icon}
                  </div>
                  <h4 className="font-bold text-xl mb-2 transition-colors duration-300 hover:text-[#E91E63]">
                    {step.title}
                  </h4>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
