"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import "../../node_modules/flatpickr/dist/flatpickr.min.css";
import "../../node_modules/jsvectormap/dist/jsvectormap.css";

import Loader from "@/components/common/Loader";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";

const queryClient = new QueryClient();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      const token = searchParams?.get('token');
      
      if (!token) {
        window.location.href = 'https://car-rental-fullstack.vercel.app';
        return;
      }

      try {
        // Verify token using the verify:verifyStaffToken endpoint
        const response = await axios.post(`${API_BASE_URL}/query`, {
          path: "verify:verifyStaffToken",
          args: { token }
        });
    
        if (response.data.status!=='success') {
          window.location.href = 'https://car-rental-fullstack.vercel.app';
          return;
        }

        // If valid, store token in cookie
        document.cookie = `auth=${token}; path=/; secure; samesite=strict`;
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'https://car-rental-fullstack.vercel.app';
      }
    };

    checkAuth();
  }, [searchParams]);

  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <body suppressHydrationWarning={true}>
          <div className="dark:bg-boxdark-2 dark:text-bodydark">
            {loading ? <Loader /> : children}
          </div>
        </body>
      </html>
    </QueryClientProvider>
  );
}
