import React from "react";

interface resultsProps {
  iletsScores: string[];
  toeflScores: string[];
  feedBack: string[];
}

function ResultsComponent({
  iletsScores,
  toeflScores,
  feedBack,
}: resultsProps) {
  return (
    <div>
      <h1> {iletsScores} </h1>
      <h1>{toeflScores}</h1>
      <h1>{feedBack}</h1>
    </div>
  );
}

export default ResultsComponent;
