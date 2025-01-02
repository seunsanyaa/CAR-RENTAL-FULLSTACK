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
    const checkAuth = async (retryCount = 0): Promise<void> => {
      try {
        setLoading(true);
        // First check if auth cookie exists
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
        
        if (!authCookie) {
          const token = searchParams?.get('token');
          
          if (!token) {
            throw new Error('No authentication token found');
          }

          // First verify the token
          const verifyResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "verify:verifyStaffToken",
            args: { token }
          });

          if (!verifyResponse.data || verifyResponse.data.status !== 'success') {
            throw new Error('Invalid token verification response');
          }

          // Get staff member data
          const staffMember = verifyResponse.data.value?.staffMember;
          if (!staffMember) {
            throw new Error('No staff member data found');
          }

          // Get email from response or URL params as fallback
          const emailFromParams = searchParams?.get('email');
          const staffEmail = staffMember.email || emailFromParams;

          if (!staffEmail) {
            throw new Error('No email found in response or parameters');
          }

          // Only store data after all checks pass
          localStorage.setItem('staffEmail', staffEmail);
          document.cookie = `role=${staffMember.role || 'manager'}; path=/; secure; samesite=strict`;
          document.cookie = `auth=${token}; path=/; secure; samesite=strict`;
        }
      } catch (error) {
        console.error('Authentication error:', error);
        
        if (retryCount < 3) {
          console.log(`Retrying authentication (attempt ${retryCount + 1}/3)...`);
          // Wait for 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkAuth(retryCount + 1);
        }
        
        // After all retries failed, show error and redirect
        alert('Authentication failed. Redirecting to login...');
        window.location.href = 'https://final-project-customer-rosy.vercel.app/Login';
      } finally {
        setLoading(false);
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
