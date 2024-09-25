'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useInView } from 'react-intersection-observer';

export function Goldhome() {
  const [ref1, inView1] = useInView({ threshold: 0.6, triggerOnce: true });
const [ref2, inView2] = useInView({ threshold: 0.6,triggerOnce: true  });
const [ref3, inView3] = useInView({ threshold: 0.3,triggerOnce: true });
  return (
    (<div className="flex flex-col min-h-[100dvh]">
      <header
        className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" prefetch={false}>
          <CarIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">Golden Rentals</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
            Discover
          </Link>
          <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
            Deals
          </Link>
          <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
            Cars
          </Link>
          <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
            Account
          </Link>
        </nav>
        <Button variant="outline" size="sm" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </header>
      <main className="flex-1">
        <section ref={ref1} className={`"bg-muted py-12 md:py-24 ${
        inView1 ? 'animate-fadeInUp' : 'opacity-0'
       }`}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div
                  className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Discover
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Golden Locations</h2>
                <p className="text-muted-foreground md:text-xl">
                  Explore our exclusive rental hubs available only to our golden members.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/Golden/GoldenHome/Goldmap"><Button>Explore Map</Button></Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
              <div className="relative h-[400px] sm:h-[500px] lg:h-auto">
                <img
                  src="/placeholder.svg"
                  width={800}
                  height={600}
                  alt="Map"
                  className="object-cover w-full h-full rounded-xl"
                  style={{ aspectRatio: "800/600", objectFit: "cover" }} />
                <div
                  className="absolute top-4 left-4 bg-background/80 p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold">New York City</h3>
                  <p className="text-muted-foreground">Exclusive golden member rental hub</p>
                  <Button size="sm" className="mt-2">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section ref={ref2} className={`bg-background py-12 md:py-24 ${
        inView2 ? 'animate-fadeInUp' : 'opacity-0'
       }`}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="relative h-[400px] sm:h-[500px] lg:h-auto">
                <img
                  src="/placeholder.svg"
                  width={800}
                  height={600}
                  alt="Deals"
                  className="object-cover w-full h-full rounded-xl"
                  style={{ aspectRatio: "800/600", objectFit: "cover" }} />
                <div
                  className="absolute top-4 right-4 bg-background/80 p-4 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold">Gilded Deals</h3>
                  <p className="text-muted-foreground">Exclusive discounts and offers for golden members</p>
                  <Link href='../Golden/GoldenHome/Golddeals'><Button size="sm" className="mt-2">
                    View Deals
                  </Button></Link>
                </div>
              </div>
              <div className="space-y-4">
                <div
                  className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Exclusive
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Gilded Deals</h2>
                <p className="text-muted-foreground md:text-xl">
                  Discover the best rental deals and offers available only to our golden members.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href='../Golden/GoldenHome/Golddeals'><Button>View Deals</Button></Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section ref={ref3}className={`bg-muted py-12 md:py-24 ${
        inView3 ? 'animate-fadeInUp' : 'opacity-0'
       }`}>
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div
                  className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Premium
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Star Cars</h2>
                <p className="text-muted-foreground md:text-xl">
                  Explore our exclusive collection of luxury and premium vehicles available only to golden members.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href='../Golden/GoldenHome/StarCars'><Button>View Cars</Button></Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-[200px] sm:h-[250px] lg:h-auto">
                  <img
                    src="/placeholder.svg"
                    width={400}
                    height={300}
                    alt="Car 1"
                    className="object-cover w-full h-full rounded-xl"
                    style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                  <div
                    className="absolute top-4 left-4 bg-background/80 p-2 rounded-lg shadow-lg">
                    <h4 className="text-sm font-semibold">Mercedes-Benz S-Class</h4>
                  </div>
                </div>
                <div className="relative h-[200px] sm:h-[250px] lg:h-auto">
                  <img
                    src="/placeholder.svg"
                    width={400}
                    height={300}
                    alt="Car 2"
                    className="object-cover w-full h-full rounded-xl"
                    style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                  <div
                    className="absolute top-4 left-4 bg-background/80 p-2 rounded-lg shadow-lg">
                    <h4 className="text-sm font-semibold">Lexus LX</h4>
                  </div>
                </div>
                <div className="relative h-[200px] sm:h-[250px] lg:h-auto">
                  <img
                    src="/placeholder.svg"
                    width={400}
                    height={300}
                    alt="Car 3"
                    className="object-cover w-full h-full rounded-xl"
                    style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                  <div
                    className="absolute top-4 left-4 bg-background/80 p-2 rounded-lg shadow-lg">
                    <h4 className="text-sm font-semibold">BMW 7 Series</h4>
                  </div>
                </div>
                <div className="relative h-[200px] sm:h-[250px] lg:h-auto">
                  <img
                    src="/placeholder.svg"
                    width={400}
                    height={300}
                    alt="Car 4"
                    className="object-cover w-full h-full rounded-xl"
                    style={{ aspectRatio: "400/300", objectFit: "cover" }} />
                  <div
                    className="absolute top-4 left-4 bg-background/80 p-2 rounded-lg shadow-lg">
                    <h4 className="text-sm font-semibold">Audi A8</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-primary-foreground py-6 px-4 md:px-6">
        <div className="container flex items-center justify-between">
          <p className="text-sm">&copy; 2024 Golden Rentals. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
              Privacy
            </Link>
            <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
              Terms
            </Link>
            <Link href="#" className="hover:underline underline-offset-4" prefetch={false}>
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>)
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


function MenuIcon(props) {
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>)
  );
}
