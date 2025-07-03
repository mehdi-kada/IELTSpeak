export const metadata: Metadata = {
  title: "IELTS Band Levels",
  description:
    "Select your target IELTS band score (6.5, 7, 7.5, 8, 8.5, 9) and start a realistic speaking practice test with the AI examiner. Get tailored practice for your band level.",
  keywords: [
    "IELTS Speaking bands",
    "IELTS band score practice",
    "Band 7 IELTS Speaking",
    "Band 8 IELTS Speaking",
    "Band 9 IELTS Speaking",
    "select IELTS band level",
    "AI IELTS tutor",
    "IELTS mock test",
  ],
};

import LevelCard from "@/components/LevelCard";
import { levels } from "@/constants/constants";
import { Metadata } from "next";
import React from "react";

function Levels() {
  // Define order classes for each band level
  const getOrderClasses = (level: string) => {
    const orderMap = {
      "6.5": "order-1 lg:order-1",
      "7": "order-2 lg:order-2",
      "7.5": "order-3 lg:order-3",
      "8": "order-4 lg:order-4",
      "8.5": "order-5 lg:order-5",
      "9": "order-6 lg:order-6",
    };
    return orderMap[level as keyof typeof orderMap] || "";
  };

  return (
    <div className="flex justify-center">
      <div className="container max-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mt-6">Choose Your Target Band</h1>
          <p className="text-gray-400">
            Select your target IELTS band score to begin your targeted speaking
            practice.
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
