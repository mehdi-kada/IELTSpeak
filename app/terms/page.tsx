export const metadata: Metadata = {
  title: "Terms of Service | IELTSpeak",
  description:
    "Read the terms of service for IELTSpeak. Understand your rights and responsibilities when using our application and services.",
};

import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export default function TermsOfUse() {
  return (
    <>
      <div className="flex items-center justify-center mt-12 gap-1">
        <Link href="/">
          <h1 className="text-4xl text-center font-bold text-red-600">
            IELTSpeak
          </h1>
        </Link>
      </div>
      <div className=" py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-[#2F2F7F]/50 p-8 sm:p-12 rounded-lg shadow-md">
          <div className="prose prose-lg max-w-none">
            <h1>Terms of Use for IELTSpeak</h1>
            <p className="text-sm text-gray-500">Last Updated: July 10, 2025</p>

            <p>
              Welcome to IELTSpeak! These Terms of Use ("Terms") govern your
              access to and use of our application and services (the "Service").
              Please read these Terms carefully before using the Service. By
              accessing or using the Service, you agree to be bound by these
              Terms.
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account and using our Service, you confirm that you
              have read, understood, and agree to these Terms. If you do not
              agree with these Terms, you must not use the Service.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              To use our Service, you must register for an account. You agree to
              provide accurate, current, and complete information during the
              registration process. You are responsible for safeguarding your
              password and for all activities that occur under your account. You
              must notify us immediately of any unauthorized use of your
              account.
            </p>

            <h2>3. Subscriptions and Payments</h2>
            <p>
              Some parts of the Service are billed on a subscription basis. All
              payments are handled by a secure third-party payment processor.
            </p>
            <ul>
              <li>
                <strong>Billing:</strong> You will be billed in advance on a
                recurring and periodic basis ("Billing Cycle").
              </li>
              <li>
                <strong>Cancellation:</strong> You may cancel your subscription
                at any time. The cancellation will take effect at the end of the
                current Billing Cycle, and you will not be charged for the next
                cycle.
              </li>
              <li>
                <strong>No Refunds:</strong> Subscription fees are
                non-refundable except as required by law.
              </li>
            </ul>

            <h2>4. Acceptable Use Policy</h2>
            <p>
              You agree not to misuse the Service. You will not, and will not
              permit any third party to:
            </p>
            <ul>
              <li>Use the Service for any illegal or unauthorized purpose.</li>
              <li>
                Attempt to reverse engineer, decompile, or otherwise discover
                the source code of the application.
              </li>
              <li>
                Use any automated systems (bots, scrapers) to access the Service
                in a manner that sends more request messages to our servers than
                a human can reasonably produce in the same period.
              </li>
              <li>
                Interfere with or disrupt the integrity or performance of the
                Service.
              </li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of IELTSpeak and its
              licensors. You retain ownership of the content you generate during
              your practice sessions (e.g., your voice recordings and
              transcripts). You grant us a limited license to use this data
              solely to provide and improve the Service for you.
            </p>

            <h2>6. Disclaimer of Warranties and Limitation of Liability</h2>
            <h4>A. AI-Generated Scores and Feedback</h4>
            <p>
              <strong>This is a practice tool, not an official test.</strong>{" "}
              The scores, feedback, and suggestions provided by our AI models
              are for educational and practice purposes only. They are estimates
              designed to help you improve. **We make no guarantee, express or
              implied, that the scores you receive on our platform will be the
              same as your official IELTS test score.** Your official score will
              be determined solely by the human examiners on your test day.
            </p>

            <h4>B. "As Is" Service</h4>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
              do not warrant that the Service will be uninterrupted, error-free,
              or completely secure.
            </p>

            <h4>C. Limitation of Liability</h4>
            <p>
              To the maximum extent permitted by applicable law, in no event
              shall IELTSpeak, its directors, employees, or partners be liable
              for any indirect, incidental, special, consequential, or punitive
              damages arising out of your use of the Service.
            </p>

            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach the Terms. Upon termination, your
              right to use the Service will immediately cease.
            </p>

            <h2>8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the
              laws of Algeria, without regard to its conflict of law provisions.
            </p>

            <h2>9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will
              provide at least 30 days' notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact
              through the home page
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
