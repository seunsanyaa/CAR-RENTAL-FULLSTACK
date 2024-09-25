'use client';

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useInView } from 'react-intersection-observer';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Goldimage from '../ui/Gold_desk.png';

// Import icons (assuming you're using a library like react-icons or lucide-react)

export default function Test() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 md:px-6 border-b bg-primary text-primary-foreground py-6 md:py-12">
        {/* Header content */}
        <nav className="md:flex gap-4 sm:gap-6">
          <Link href="#" className="flex items-center gap-2">
            <CarIcon className="w-6 h-6" />
            <span className="text-lg font-semibold hover:text-primary-foreground transition-colors">Renta</span>
          </Link>
          {/* Add more navigation items here */}
        </nav>
        {/* Add user menu and language selector here */}
      </header>
      
      <main className="flex-1" style={{
        backgroundImage: `url(${Goldimage.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}>
        <section
          ref={sectionRef}
          className={`w-full py-12 md:py-24 lg:py-32 bg-background/10 transition-opacity duration-1000 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-5xl xl:text-6xl/none">
                    Sign up today and experience luxury
                  </h1>
                  <p className="max-w-[600px] text-primary-foreground md:text-xl">
                    Unlock exclusive perks, premium vehicles, and personalized service with our Golden Membership.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    Sign Up Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional sections can be added here */}
      </main>

      <footer className="flex items-center justify-between h-fit px-4 md:px-6 border-b bg-primary text-primary-foreground py-6 md:py-12">
        {/* Footer content */}
        <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
          {/* Add footer columns here */}
        </div>
        <h3 className="absolute right-5"> ©2024 Renta, Rent A Car Services</h3>
      </footer>
    </div>
  );
}

function CarIcon(props) {
    return (
      (<svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path
          d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>)
    );
  }
  
  
  function CheckIcon(props) {
    return (
      (<svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>)
    );
  }
  function ChevronDownIcon(props) {
    return (
      (<svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>)
    );
  }
  function FlagIcon(props) {
    return (
      (<svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>)
    );
  }
  