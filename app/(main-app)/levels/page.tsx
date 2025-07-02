export const metadata: Metadata = {
  title: "Levels",
  description:
    "Select your target IELTS band score (A1, A2, B1, B2, C1, C2) and start a realistic speaking practice test with the IELTSpeak AI examiner. Get tailored practice for your level.",
  keywords: [
    "IELTS Speaking levels",
    "IELTS band score practice",
    "B2 IELTS Speaking",
    "C1 IELTS Speaking",
    "select IELTS level",
    "AI IELTS tutor",
    "IELTS mock test",
  ],
};

import LevelCard from "@/components/LevelCard";
import { levels } from "@/constants/constants";
import { Metadata } from "next";
import React from "react";

function Levels() {
  // Define order classes for each level
  const getOrderClasses = (level: string) => {
    const orderMap = {
      A1: "order-1 lg:order-1", // Last on mobile, first on desktop
      A2: "order-2 lg:order-4",
      B1: "order-3 lg:order-2",
      B2: "order-4 lg:order-5",
      C1: "order-5 lg:order-3",
      C2: "order-6 lg:order-6", // First on mobile, last on desktop
    };
    return orderMap[level] || "";
  };

  return (
    <div className="flex justify-center">
      <div className="container max-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mt-6">Choose Your Level</h1>
          <p className="text-gray-400">
            Select a proficiency level to begin your targeted speaking practice.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {levels.map((l, index) => (
            <div key={index} className={getOrderClasses(l.level)}>
              <LevelCard
                level={l.level}
                title={l.title}
                description={l.description}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Levels;
