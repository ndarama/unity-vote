'use client';

import React from 'react';
import { Search, Mail, CheckCircle, ShieldCheck } from 'lucide-react';

export const UserGuide: React.FC = () => {
  const steps = [
    {
      icon: <Search className="w-6 h-6 text-brand-orange" />,
      title: "1. Browse Contests",
      description: "Navigate through the available contests on the homepage. You can filter contestants by category or search for specific names."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-orange" />,
      title: "2. Select a Nominee",
      description: "Click on a contestant's profile to view their biography and achievements. When you're ready, click the 'Vote' button."
    },
    {
      icon: <Mail className="w-6 h-6 text-brand-orange" />,
      title: "3. Verify Email",
      description: "Enter your email address. We will send you a 6-digit verification code to ensure each person votes only once per category."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-brand-orange" />,
      title: "4. Confirm Vote",
      description: "Enter the code you received in your email inbox to confirm your vote. You will see a success message once verified."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-brand-navy mb-4">How to Vote</h1>
          <p className="text-brand-grey max-w-2xl mx-auto">
            Participating in the awards is simple and secure. Follow this step-by-step guide to cast your vote.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-brand-navy mb-2">{step.title}</h3>
              <p className="text-sm text-brand-grey leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-navy text-white rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-brand-lightGrey mb-6">
            If you're having trouble receiving the verification code, please check your spam folder or try a different email address.
          </p>
          <a href="mailto:post@unitysummit.no" className="inline-block bg-white text-brand-navy font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};