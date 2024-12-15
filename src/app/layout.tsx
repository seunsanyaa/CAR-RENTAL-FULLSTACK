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

const queryClient = new QueryClient();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

function AuthenticationCheck({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      // First check if auth cookie exists
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
      
      if (authCookie) {
        setLoading(false);
        return; // Already authenticated
      }

      const token = searchParams?.get('token');
      
      // if (!token) {
      //   window.location.href = 'https://google.com';
      //   return;
      // }

      // try {
      //   const response = await axios.post(`${API_BASE_URL}/query`, {
      //     path: "verify:verifyStaffToken",
      //     args: { token }
      //   });
    
      //   if (response.data.status !== 'success') {
      //     window.location.href = 'https://car-rental-fullstack.vercel.app';
      //     return;
      //   }

      //   document.cookie = `auth=${token}; path=/; secure; samesite=strict`;
        setLoading(false);
      // } catch (error) {
      //   console.error('Auth error:', error);
      //   window.location.href = 'https://google.com';
      // }
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
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body suppressHydrationWarning={true}>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            <Suspense fallback={<Loader />}>
              <AuthenticationCheck>
                {children}
              </AuthenticationCheck>
            </Suspense>
          </div>
        </body>
      </html>
    </QueryClientProvider>
  );
}
