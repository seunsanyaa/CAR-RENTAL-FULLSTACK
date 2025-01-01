'use client';

import { ClerkProvider as ClientClerkProvider } from '@clerk/clerk-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ClientClerkProvider>
  );
} 