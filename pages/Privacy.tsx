'use client';

import React from 'react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className="text-3xl font-bold text-brand-navy mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none text-brand-grey space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">1. Information We Collect</h2>
            <p>We collect your email address solely for the purpose of verifying your identity during the voting process. We also collect technical data such as IP addresses and browser types to ensure the security and integrity of the voting system.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">2. How We Use Your Information</h2>
            <p>Your email address is used to send One-Time Passwords (OTPs) and to prevent duplicate voting. We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">3. Data Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information. Verification codes are transient, and voting records are stored securely.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">4. Cookies</h2>
            <p>We use local storage and essential cookies to maintain your session state and preferences (such as Admin login status). We do not use third-party tracking cookies.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold text-brand-navy mb-3">5. Contact Us</h2>
            <p>If you have any questions regarding this privacy policy, you may contact us via the support channels listed on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;