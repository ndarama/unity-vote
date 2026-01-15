'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAppContext } from '../services/AppContext';
import { Button, Input, Card } from '../components/UI';

export const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { loginAdmin } = useAppContext();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate verifying OTP
    setTimeout(() => {
      setLoading(false);
      if (otp === 'admin') { 
        loginAdmin('admin');
        router.push('/admin');
      } else if (otp === 'manager') {
        loginAdmin('manager');
        router.push('/admin');
      } else {
        alert('Invalid OTP. Use "admin" for Full Access or "manager" for Contestant Manager role.');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-brand-orange" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-brand-lightGrey mt-2">Secure entry for contest managers</p>
        </div>

        <Card className="p-8 backdrop-blur-md bg-white/95 border-none shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <Input 
                label="Administrator Email" 
                type="email" 
                placeholder="admin@unitysummit.no"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Send Magic Link
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-brand-grey">Enter the code sent to {email}</p>
                <p className="text-xs text-brand-lightGrey mt-1">Hint: Use &quot;admin&quot; or &quot;manager&quot;</p>
              </div>
              <Input 
                label="One-Time Password" 
                type="password" 
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Verify & Login
              </Button>
              <button 
                type="button" 
                onClick={() => setStep('email')}
                className="w-full text-sm text-brand-grey hover:underline mt-4"
              >
                Back to Email
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;