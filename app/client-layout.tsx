'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Ticket, MapPin, Mail, Phone } from 'lucide-react';
import { useAppContext } from '@/services/AppContext';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/UI';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
      
      {!isLoginPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>

      {/* Pre-Footer Section: Tickets & Contact */}
      {!isLoginPage && (
        <div className="bg-brand-navy text-white py-16 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
              
              {/* Column 1: Buy Your Ticket */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-orange p-3 rounded-xl shadow-lg shadow-brand-orange/20">
                    <Ticket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Buy Your Ticket</h2>
                    <p className="text-brand-lightGrey text-sm">Join the grand ceremony</p>
                  </div>
                </div>
                <p className="text-brand-lightGrey leading-relaxed max-w-md">
                  Don&apos;t miss out on the most inspiring event of the year. Secure your spot at the Unity Summit & Awards 2026 today. Experience the celebration of leadership and community firsthand.
                </p>
                <button className="bg-white text-brand-navy hover:bg-brand-orange hover:text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-md transform hover:-translate-y-1">
                  Purchase Tickets
                </button>
              </div>

              {/* Column 2: Contact Address */}
              <div className="space-y-6 md:border-l md:border-white/10 md:pl-12">
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                   Contact Information
                 </h2>
                 <div className="space-y-4">
                   <div className="flex items-start gap-4">
                     <div className="bg-white/10 p-2 rounded-lg shrink-0">
                       <MapPin className="w-5 h-5 text-brand-orange" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-white">Event Venue</h4>
                       <p className="text-brand-lightGrey">Oslo Concert Hall</p>
                       <p className="text-brand-lightGrey">Munkedamsveien 14, 0115 Oslo, Norway</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     <div className="bg-white/10 p-2 rounded-lg shrink-0">
                       <Mail className="w-5 h-5 text-brand-orange" />
                     </div>
                     <a href="mailto:tickets@unitysummit.com" className="text-brand-lightGrey hover:text-white transition-colors">
                       tickets@unitysummit.com
                     </a>
                   </div>

                   <div className="flex items-center gap-4">
                     <div className="bg-white/10 p-2 rounded-lg shrink-0">
                       <Phone className="w-5 h-5 text-brand-orange" />
                     </div>
                     <span className="text-brand-lightGrey">+47 22 83 45 10</span>
                   </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {!isLoginPage && (
        <footer className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold text-brand-navy">Unity Vote</p>
              <p className="text-sm text-brand-grey mt-1">© 2026 Unity Summit & Awards. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-brand-grey">
              <Link href="/guide" className="hover:text-brand-orange transition-colors">User Guide</Link>
              <Link href="/terms" className="hover:text-brand-orange transition-colors">Terms & Conditions</Link>
              <Link href="/privacy" className="hover:text-brand-orange transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
