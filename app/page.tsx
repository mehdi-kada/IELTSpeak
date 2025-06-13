import React from "react";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";

function LandingPage() {
  return (
    <div className="text-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;
