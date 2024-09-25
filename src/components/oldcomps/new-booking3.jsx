"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export function NewBooking3() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="md:flex gap-4 sm:gap-6 bg-gray-800 text-white p-4 border-black">
        <div className="flex flex-col items-start gap-2">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <svg
      
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"
      />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  <span className="text-lg font-semibold hover:text-gray-300 transition-colors">Renta</span>
</Link>


          {/* Menu button, shown on small screens, placed under the logo */}
          <button
            className="md:hidden flex items-center text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
<svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>

          </button>
        </div>

        {/* Navbar items, hidden on small screens */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="#"
            className="text-muted-foreground hover:text-gray-300 transition-colors"
            prefetch={false}
          >
            Search
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-gray-300 transition-colors"
            prefetch={false}
          >
            Ratings & Reviews
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-gray-300 transition-colors"
            prefetch={false}
          >
            My Bookings
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-gray-300 px-3 py-2 rounded-md transition-colors"
            prefetch={false}
          >
            Accessibility
          </Link>
        </div>
      </nav>

      {/* Side Menu, slides in from the left */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
        style={{ opacity: 1, backgroundColor: '#ffffff', zIndex: 50 }}
      >
        <div className="flex justify-between items-center p-4">
          <div className="text-2xl font-bold">
            <Link href="/">Renta Car Services</Link>
          </div>
          <div
            className="cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <nav className="mt-8">
          <ul>
            <li className="p-4 text-xl font-semibold text-orange-600">
              <Link href="/">Search</Link>
            </li>
            <li className="p-4 text-xl font-semibold">
              <Link href="/">Ratings & Reviews</Link>
            </li>
            <li className="p-4 text-xl font-semibold">
              <Link href="/">My Bookings</Link>
            </li>
            <li className="p-4 text-xl font-semibold">
              <Link href="/">Accessibility</Link>
            </li>
            <li>
         <Separator />
          <div className="p-4 text-xl font-semibold bottom-0 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="h-5 w-5"
          >
          <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
          </svg>
          <Link href="/" className="">Settings</Link>
        </div>
        </li>
          </ul>
        </nav>
      </div>

      <Separator />

      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="grid md:grid-cols-[1fr_300px] gap-8 md:gap-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
            <p className="text-muted-foreground">Choose your extras, and complete your booking.</p>
          </div>
          <div className="space-y-6">
            <div>  {/* MAKE THIS MODULAR SO THAT WHEN A USER IS BOOKING FROM PROMOTIONS HE CAN SELECT CAR OTHERWISE THE CAR HE CHOSE IS SPECIFIED INSTEAD */}
              <h2 className="text-2xl font-semibold">Select Car</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="group">
                  <CardContent>
                    <img
                      src="/placeholder.svg"
                      width={300}
                      height={200}
                      alt="Car"
                      className="rounded-lg object-cover aspect-video" />
                    <div className="mt-4 space-y-1">
                      <h3 className="text-lg font-semibold">Toyota Corolla</h3>
                      <p className="text-muted-foreground">Compact</p>
                      <p className="font-semibold">$50/day</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Select
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="group">
                  <CardContent>
                    <img
                      src="/placeholder.svg"
                      width={300}
                      height={200}
                      alt="Car"
                      className="rounded-lg object-cover aspect-video" />
                    <div className="mt-4 space-y-1">
                      <h3 className="text-lg font-semibold">Honda Civic</h3>
                      <p className="text-muted-foreground">Compact</p>
                      <p className="font-semibold">$55/day</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Select
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="group">
                  <CardContent>
                    <img
                      src="/placeholder.svg"
                      width={300}
                      height={200}
                      alt="Car"
                      className="rounded-lg object-cover aspect-video" />
                    <div className="mt-4 space-y-1">
                      <h3 className="text-lg font-semibold">Ford Mustang</h3>
                      <p className="text-muted-foreground">Midsize</p>
                      <p className="font-semibold">$75/day</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Select
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="group">
                  <CardContent>
                    <img
                      src="/placeholder.svg"
                      width={300}
                      height={200}
                      alt="Car"
                      className="rounded-lg object-cover aspect-video" />
                    <div className="mt-4 space-y-1">
                      <h3 className="text-lg font-semibold">Kia Sportage</h3>
                      <p className="text-muted-foreground">Midsize</p>
                      <p className="font-semibold">$65/day</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Select
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="filter">Filter by:</Label>
                  <Select id="filter" className="w-40">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="features">Features</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="duration">Rental Duration:</Label>
                  <Select id="duration" className="w-40">
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="pickup-date">Pickup Date & Time</Label>
              <Input type="datetime-local" id="pickup-date" className="mt-1 w-full" />
            </div>
            <div>
              <Label htmlFor="dropoff-date">Drop-off Date & Time</Label>
              <Input type="datetime-local" id="dropoff-date" className="mt-1 w-full" />
            </div>
            </div>
            </div>
            <div>
            <div>
              <h2 className="text-2xl font-semibold">Choose Extras</h2>
              <div className="grid gap-4">
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Insurance</h3>
                        <p className="text-muted-foreground">Protect your rental with our comprehensive coverage.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$10/day</p>
                        <Checkbox />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">GPS</h3>
                        <p className="text-muted-foreground">Never get lost with our built-in navigation.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$5/day</p>
                        <Checkbox />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Child Seat</h3>
                        <p className="text-muted-foreground">Keep your little ones safe and secure.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">$8/day</p>
                        <Checkbox />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p>Car Rental</p>
                  <p className="font-semibold">$50/day</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>Insurance</p>
                  <p className="font-semibold">$10/day</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>GPS</p>
                  <p className="font-semibold">$5/day</p>
                </div>
                <div className="flex items-center justify-between">
                  <p>Child Seat</p>
                  <p className="font-semibold">$8/day</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-lg font-semibold">$73/day</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Go Back
                </Button>
                <Link href="/Newbooking/payment"><Button className="flex-1">Continue</Button></Link>
              </div>
            </CardFooter>
          </Card>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input id="pickup" placeholder="Enter location" />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="dropoff">Drop-off Location</Label>
              <Input id="dropoff" placeholder="Enter location" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Separator />

<footer className="bg-gray-900 text-white py-6 md:py-12">
  <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm px-4 md:px-6">
    <div className="grid gap-1">
      <h3 className="font-semibold">Company</h3>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        About Us
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Our Team
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Careers
      </Link>
    </div>
    <div className="grid gap-1">
      <h3 className="font-semibold">Products</h3>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Cars
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Vans
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Accessibility Vehicles
      </Link>
    </div>
    <div className="grid gap-1">
      <h3 className="font-semibold">Resources</h3>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        FAQ
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Ratings and Reviews
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Support
      </Link>
    </div>
    <div className="grid gap-1">
      <h3 className="font-semibold">Legal</h3>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Privacy Policy
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Terms of Service
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Cookie Policy
      </Link>
    </div>
    <div className="grid gap-1">
      <h3 className="font-semibold">Contact</h3>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Email Us
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Find a Location
      </Link>
      <Link href="#" prefetch={false} className="hover:text-gray-400 rounded-md transition-colors">
        Call Us
      </Link>
    </div>
  </div>
  <div className="text-center text-muted-foreground mt-6">
    &copy; 2024 Renta Car Services. All rights reserved.
  </div>
</footer>
</>
);
}