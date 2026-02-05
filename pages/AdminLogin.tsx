'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { useAppContext } from '../services/AppContext';
import { Button, Input, Card } from '../components/UI';

export const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { loginAdmin } = useAppContext();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [adminId, setAdminId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Check if login was auto-verified (development mode)
      if (data.autoVerified && data.admin) {
        // Update app context with admin info
        loginAdmin(data.admin.role);
        
        // Redirect to admin dashboard
        router.push('/admin');
        return;
      }

      // Otherwise, proceed to OTP step
      setAdminId(data.adminId);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'OTP verification failed');
        setLoading(false);
        return;
      }

      // Update app context with admin info
      loginAdmin(data.admin.role);
      
      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <Input 
                label="Administrator Email" 
                type="email" 
                placeholder="admin@unitysummit.no"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Send OTP Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center mb-4">
                <p className="text-sm text-brand-grey">Enter the 6-digit code sent to {email}</p>
                <p className="text-xs text-brand-lightGrey mt-1">Code expires in 10 minutes</p>
              </div>
              <Input 
                label="One-Time Password" 
                type="text" 
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
                autoFocus
                required
              />
              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Verify & Login
              </Button>
              <button 
                type="button" 
                onClick={() => {
                  setStep('credentials');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-sm text-brand-grey hover:underline mt-4"
              >
                Back to Login
              </button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;