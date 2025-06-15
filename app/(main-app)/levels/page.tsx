"use client";
import LevelCard from "@/components/LevelCard";
import { levels } from "@/constants/constants";
import React from "react";

function Levels() {
  return (
    <div className="flex justify-center">
      <div className="container max-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold mt-6 ">Choose Your Level</h1>
          <p className="text-gray-400 ">
            Select a proficiency level to begin your targeted speaking practice.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {levels.map((l, index) => (
            <LevelCard
              key={index}
              level={l.level}
              title={l.title}
              description={l.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Levels;
