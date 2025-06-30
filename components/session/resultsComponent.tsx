import React from "react";

interface resultsProps {
  iletsScores: string[];
  feedBack: string[];
}

function ResultsComponent({
  iletsScores,
  feedBack,
}: resultsProps) {
  return (
    <div>
      <h1> {iletsScores} </h1>
      <h1>{feedBack}</h1>
    </div>
  );
}

export default ResultsComponent;
