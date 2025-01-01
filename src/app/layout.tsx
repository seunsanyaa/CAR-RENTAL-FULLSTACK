"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import "../../node_modules/flatpickr/dist/flatpickr.min.css";
import "../../node_modules/jsvectormap/dist/jsvectormap.css";

import Loader from "@/components/common/Loader";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { Suspense, useEffect, useState } from "react";
import Providers from "@/components/Providers";

const queryClient = new QueryClient();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

function AuthenticationCheck({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async (retryCount = 0) => {
      // First check if auth cookie exists
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
      
      if (authCookie) {
        // Check number of bookings
        try {
          const email = localStorage.getItem('staffEmail');
          if (email) {
            const bookingsResponse = await axios.post(`${API_BASE_URL}/query`, {
              path: "booking:getBookingsByEmail",
              args: { email }
            });
            
            if (bookingsResponse.data?.value?.length >= 3) {
              alert('Warning: You have 3 or more active bookings!');
            }
          }
        } catch (error) {
          console.error('Error checking bookings:', error);
        }
        
        setLoading(false);
        return; // Already authenticated
      }

      const token = searchParams?.get('token');
      
      if (!token) {
        window.location.href = 'https://final-project-customer-rosy.vercel.app/Login';
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/query`, {
          path: "verify:verifyStaffToken",
          args: { token }
        });
        console.log('Full API Response:', response.data);
        
        if (!response.data || response.data.status !== 'success') {
          throw new Error('Invalid response status');
        }

        // Get email from URL params as fallback
        const emailFromParams = searchParams?.get('email');
        const staffEmail = response.data.value?.staffMember?.email || emailFromParams;

        if (!staffEmail) {
          throw new Error('No email found');
        }

        // Store email in localStorage
        localStorage.setItem('staffEmail', staffEmail);
        document.cookie = `role=${response.data.value?.staffMember?.role || 'manager'}; path=/; secure; samesite=strict`;
        document.cookie = `auth=${token}; path=/; secure; samesite=strict`;
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        
        if (retryCount < 3) {
          console.log(`Retrying authentication (attempt ${retryCount + 1}/3)...`);
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkAuth(retryCount + 1);
        }
        
        // After all retries failed, redirect to login
        window.location.href = 'https://final-project-customer-rosy.vercel.app/Login';
      }
    };

    checkAuth();
  }, [searchParams]);

  if (loading) return <Loader />;
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <Suspense fallback={<Loader />}>
              <AuthenticationCheck>
                {children}
              </AuthenticationCheck>
            </Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
