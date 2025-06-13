import Link from "next/link";
import React from "react";

const FinalCTASection = () => {
  return (
    <section className="py-20 px-5">
      <div className="container mx-auto text-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Boost Your Score?
        </h3>
        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
          Join hundreds of students who have gained confidence and achieved
          their target scores with LangAI.
        </p>
        <Link
          href="/subscribe"
          className="cta-button text-white font-bold py-4 px-10 rounded-lg text-lg"
        >
          Start Practicing for Free
        </Link>
      </div>
    </section>
  );
};

export default FinalCTASection;
