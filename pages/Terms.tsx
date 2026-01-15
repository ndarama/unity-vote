'use client';

import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-brand-navy mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-slate max-w-none text-brand-grey space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">1. Introduction</h2>
            <p>Welcome to Unity Vote. By accessing or using our voting platform, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">2. Eligibility</h2>
            <p>Voting is open to the public. To cast a vote, you must provide a valid email address and verify it via a One-Time Password (OTP). Each email address is limited to one vote per contest category, unless otherwise specified in the contest rules.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">3. Voting Integrity</h2>
            <p>We take the integrity of our voting process seriously. Any attempt to manipulate votes using bots, scripts, automated systems, or disposable email addresses is strictly prohibited. We reserve the right to disqualify votes or contestants if fraudulent activity is detected.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">4. Intellectual Property</h2>
            <p>All content displayed on Unity Vote, including contestant photos and descriptions, remains the property of their respective owners. The Unity Vote platform design and code are owned by us.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">5. Changes to Terms</h2>
            <p>We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;