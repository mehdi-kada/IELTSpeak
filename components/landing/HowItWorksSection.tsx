import React from "react";

interface StepProps {
  stepNumber: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({
  stepNumber,
  icon,
  title,
  description,
}) => {
  return (
    <div className="relative">
      <div className="absolute -top-4 -right-4 text-6xl font-black text-blue-800 opacity-50">
        {stepNumber}
      </div>
      <div className="text-red-500 mb-4 inline-block">{icon}</div>
      <h4 className="font-bold text-xl mb-2">{title}</h4>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const HowItWorksSection = () => {
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
      title: "Choose Mode",
      description:
        "Select your proficiency level and decide if you want a casual practice or a formal exam simulation.",
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
        "Engage in a conversation with our AI. It asks questions, understands your responses, and adapts the dialogue.",
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
        "Instantly review your performance, see your estimated score, and read transcripts to find areas for improvement.",
    },
  ];

  return (
    <section className="py-20 px-5 bg-[#101030] bg-opacity-30 ">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-3">
            Get Your Target Score in 3 Simple Steps
          </h3>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start practicing in seconds. Our streamlined process gets you
            talking right away.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
          {steps.map((step, index) => (
            <Step
              key={index}
              stepNumber={step.stepNumber}
              icon={step.icon}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
