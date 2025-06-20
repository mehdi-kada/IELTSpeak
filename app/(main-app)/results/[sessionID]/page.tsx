import { EvaluationData } from "@/types/types";
import { useParams } from "next/navigation";

import React, { use, useEffect, useState } from "react";

async function Practice() {
  const sessionId = useParams().sessionID as string;

  const [evaluateData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvaluationData = () => {
      try {
        const storedData = localStorage.getItem(`evaluation_${sessionId}`);
        if (storedData) {
          setEvaluationData(JSON.parse(storedData));
          setLoading(false);
          //clean up localStorage after loading
          localStorage.removeItem(`evaluation_${sessionId}`);
          return;
        }
        // if no stored data, fetch from data base as a fallback
        fetchFromDatabase();
      } catch (error) {
        console.error("Error loading evaluation data:", error);
        setError("Failed to load evaluation data");
        setLoading(false);
      }
    };

    const fetchFromDatabase = async () => {
      try {
        const res = await fetch(`api/results/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setEvaluationData(data);
        } else {
          setError("no evaluation data found in data base for that session");
        }
      } catch (error) {
        setError("Failed to fetch evaluation data");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadEvaluationData();
    }
  }, [sessionId]);

  return <div></div>;
}

export default Practice;
