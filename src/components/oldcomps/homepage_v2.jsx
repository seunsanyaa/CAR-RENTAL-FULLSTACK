
'use client'
import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useInView } from 'react-intersection-observer';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import carImage from '../ui/car.png'; 
export function Homepage_v2() {
  const [ref1, inView1] = useInView({ threshold: 0.6, triggerOnce: true });
const [ref2, inView2] = useInView({ threshold: 0.6,triggerOnce: true  });
const [ref3, inView3] = useInView({ threshold: 0.3,triggerOnce: true });
const [ref4, inView4] = useInView({ threshold: 0.3,triggerOnce: true });
  return (
    (<div className="flex flex-col min-h-dvh">
      <header
        className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-primary text-primary-foreground py-6 md:py-12">
        <nav className=" md:flex gap-4 sm:gap-6">
          <Link href="#" className="flex items-center gap-2" >
            <CarIcon className="w-6 h-6 " />
            <span className="text-lg font-semibold hover:text-primary-foreground transition-colors">Renta</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/Search"
              className="text-muted-foreground hover:text-primary-foreground transition-colors"
              >
              Search
            </Link>
            <Link
              href="/Rating_Reviews"
              className="text-muted-foreground hover:text-primary-foreground transition-colors"
              >
              Ratings & Reviews
            </Link>
            <Link
              href="/Bookingdetail"
              className="text-muted-foreground hover:text-primary-foreground transition-colors"
              >
              My Bookings
            </Link>
            <Link
              href="/Accessibility"
              className="text-muted-foreground hover:bg-[#003366] rounded-lg py-1 px-1 hover:text-[#ffffff] transition-colors"
              >
              Accessibility
            </Link>
            <Link
              href="/Golden"
              className="text-muted-foreground hover:bg-[#000000] rounded-lg py-1 px-1 hover:text-[#FFD700] transition-colors"
              >
              Golden Members
            </Link>
          </div>
        </nav>
        <div className="flex items-center gap-4">
        <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-1 text-muted-foreground  hover:text-primary-foreground transition-colors">
                <span>Language</span>
                <ChevronDownIcon className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="#" className="flex items-center gap-2" >
                    <FlagIcon className="h-4 w-4" />
                    <span>Türkçe</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="#" className="flex items-center gap-2" >
                    <FlagIcon className="h-4 w-4" />
                    <span>English</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="#" className="flex items-center gap-2" >
                    <FlagIcon className="h-4 w-4" />
                    <span>العربية</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 rounded-xl">
                  <AvatarImage src="/placeholder-user.jpg" className="rounded-xl" />
                  <AvatarFallback>JP</AvatarFallback>
                  <span className="sr-only">Toggle user menu</span>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem><Link href="/User_Account">My Account</Link></DropdownMenuItem>
                <DropdownMenuItem><Link href='/Settings'>Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><Link href='/Login'>Logout</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </header>
      <main className="flex-1">
      <section  ref={ref1}className={`relative top-0 md:py-16 h-[400px] px-4 md:px-6 lg:px-10 bg-cover bg-center bg-no-repeat ${
        inView1 ? 'animate-fadeInUp' : 'opacity-0'
       }`}
       style={{ backgroundImage: `url(${carImage.src})` }}
    >
      <div className="absolute top-0 left-[45vw] flex flex-col  gap-4 p-2 w-[45vw]">
        <div>
          <h1 className="text-5xl font-bold tracking-tight ">Find your perfect ride</h1>
          
          <form className="flex gap-2 mt-6">
            <input
              type="text"
              placeholder="Search by location or vehicle"
              className="flex-1 p-2 border border-gray-300 rounded-lg w-full"
            />
            <Button type="submit" className="whitespace-nowrap p-4">
              Search
            </Button>
          </form>
        </div>
      </div>
    </section>

       
        <section ref={ref2 }className={`relative  w-full h-[400px] md:h-[500px] lg:h-[500px] overflow-hidden bg-muted ${
        inView2 ? 'animate-fadeInUp' : 'opacity-0'
       }`}>
          <div className="w-full mx-auto space-y-6 pt-5 pb-5 md:space-y-8 lg:space-y-10 bg-muted">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Special Offers</h2>
              <p className="text-muted-foreground text-lg md:text-xl lg:text-2xl">
                Check out our latest deals and discounts on car rentals.
              </p></div>
            </div>
            <Carousel >
            <CarouselContent >
              <CarouselItem className='h-full'>
                <div
                  className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-6 lg:px-10">
                  <div className="space-y-4 md:space-y-6 lg:space-y-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                      Discover the Perfect Car for Your Next Adventure
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                    Rent the car of your dreams and explore the wilderness. 15% off for the summer season on choice* cars.
                    </p>
                    <Link href="/Promotions">
                    <Button className="bg-customyello text-primary-foreground border-2 border-black" >
                      Book Now
                    </Button></Link>
                  </div>
                  <img
                  src="https://th.bing.com/th/id/OIP.m9QHgUPLEGoc9Z01TrxDEwHaEi?w=259&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                  width="400"
                  height="300"
                  alt="Car"
                  className="w-[400px] h-[300px] object-cover"
                  />

                </div>
              </CarouselItem>
              <CarouselItem>
                <div
                  className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-6 lg:px-10">
                  <div className="space-y-4 md:space-y-6 lg:space-y-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Experience the Thrill of Driving</h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                      Rent the car of your dreams and experience the bustling nightlife. 10% off on sports cars for a week.
                    </p>
                    <Link href="/Promotions">
                    <Button className="bg-customyello text-primary-foreground border-2 border-black" >
                      Book Now
                    </Button></Link>
                  </div>
                  <img
                  src="https://th.bing.com/th/id/OIP.52cgWj3WF9wO9DhUnM7QzwHaEK?w=326&h=183&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                  alt="Car"
                  className="w-[400px] h-[300px] object-cover"
                  />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div
                  className="flex flex-col md:flex-row items-center justify-between h-full px-4 md:px-6 lg:px-10">
                  <div className="space-y-4 md:space-y-6 lg:space-y-8">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">Elevate Your Travel Experience</h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground">
                      Hop in with some friends for the long haul. 20% on travel vans when renting up to a month.
                    </p>
                    <Link href="/Promotions">
                    <Button className="bg-customyello text-primary-foreground border-2 border-black" >
                      Book Now
                    </Button></Link>
                  </div>
                  <img
                  src="https://th.bing.com/th/id/OIP.rKo5MDyNlbpf1d6CEltozQHaE8?w=236&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                  width="400"
                  height="300"
                  alt="Car"
                  className="w-[400px] h-[300px] object-cover"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious
              className="absolute left-4 md:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-10">
              <ChevronLeftIcon className="w-6 h-6" />
            </CarouselPrevious>
            <CarouselNext
              className="absolute right-4 md:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-10">
              <ChevronRightIcon className="w-6 h-6" />
            </CarouselNext>
          </Carousel>
          
        </section>
        <section ref={ref3 }className={`relative py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 bg-primary ${ 
          inView3 ? 'animate-fadeInUp' : "opacity-0"}`}>
          <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-background">Explore our fleet</h2>
                <p className="text-background md:text-lg">
                  Choose from a wide range of vehicles to fit your needs.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
                <Card className="rounded-xl  border-foreground hover:border-background transition-colors" >
                  <CardContent className=" rounded-xl bg-customgrey flex flex-col items-center justify-center gap-4 p-6  ">
                  <CarIcon className="w-[200px] h-[150px] rounded-lg  py-3"/>
                    <div className="text-center">
                      <h3 className="text-4xl font-bold text-background ">Sedans</h3>
                      <p className="text-background">Comfortable <br/>and efficient.</p>
                    </div>
                    <Link href="/Search"><Button variant="outline">Rent Now</Button></Link>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-foreground hover:border-background transition-colors " >
                  <CardContent className=" rounded-xl flex flex-col items-center justify-center gap-4 p-6 bg-customgrey ">
                  <SUVIcon className="w-[150px] h-[150px] rounded-lg  py-3"/>
                    <div className="text-center">
                      <h3 className="text-4xl font-semibold text-background">SUVs</h3>
                      <p className="text-background">Spacious <br/>and versatile.</p>
                    </div>
                    <Link href="/Search"><Button variant="outline">Rent Now</Button></Link>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-foreground hover:border-background transition-colors" >
                  <CardContent className=" rounded-xl flex flex-col items-center justify-center gap-4 p-6 bg-customgrey ">
                  <LimoIcon className="w-[150px] h-[150px]  py-3"/>
                    <div className="text-center">
                      <h3 className="text-4xl font-semibold text-background">Luxury </h3>
                      <p className="text-background">Indulge in style and comfort.</p>
                    </div>
                    <Link href="/Search"><Button variant="outline">Rent Now</Button></Link>
                  </CardContent>
                </Card>
                <Card className="rounded-xl border-foreground hover:border-background transition-colors" >
                  <CardContent className=" rounded-xl flex flex-col items-center justify-center gap-4 p-6 bg-customgrey ">
                  <CaravanIcon className="w-[200px] h-[150px] rounded-lg text- py-3"/>
                    <div className="text-center">
                      <h3 className="text-4xl font-semibold text-background">Vans</h3>
                      <p className=" text-background">Spacious and practical.</p>
                    </div>
                    <Link href="/Search"><Button variant="outline">Rent Now</Button></Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        <section ref={ref4 } className={`relative bg-muted py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-10 ${ 
          inView4 ? 'animate-fadeInUp' : "opacity-0"}`}>
          <div className="max-w-10xl mx-auto space-y-6 md:space-y-8 lg:space-y-10">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What our customers say</h2>
                <p className="text-muted-foreground md:text-lg">Hear from real people who have rented with us.</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="border w-12 h-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-semibold">John Doe</div>
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                    &quot;I had a great experience renting with this company. The\n process was smooth and the car was in
                      excellent\n condition.&quot;
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="border w-12 h-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-semibold">Sarah Miller</div>
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                    &quot;I was impressed by the wide selection of vehicles and\n the competitive prices. I&apos;ll definitely
                      be renting from\n them again.&quot;
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="border w-12 h-12">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="font-semibold">Michael Johnson</div>
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                          <StarIcon className="w-4 h-4 fill-primary" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">
                    &quot;The rental process was quick and easy, and the staff\n was very helpful. I would definitely
                      recommend this\n company to anyone looking to rent a car.&quot;
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer
        className="flex items-center justify-between h-fit px-4 md:px-6 border-b bg-primary text-primary-foreground py-6 md:py-12 ">
          <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        <div className="grid gap-1">
          <h3 className="font-semibold">Company</h3>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            About Us
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Our Team
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Careers
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Products</h3>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Cars
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Vans
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Accessibilty Vehicles
          </Link>
          
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Resources</h3>
          <Link href="#" prefetch={false } className=" hover:text-muted-foreground  rounded-md transition-colors">
            FAQ
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Ratings and reviews
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Support
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Legal</h3>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Privacy Policy
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Terms of Service
          </Link>
          <Link href="#"  className=" hover:text-muted-foreground  rounded-md transition-colors">
            Cookie Policy
          </Link>
        </div>
        
      </div><h3 className="absolute right-5"> &#169;2024 Renta, Rent A Car Services</h3>
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


function CaravanIcon(props) {
  return (
    <svg
      {...props}
      fill="#000000"
      height="800px"
      width="800px"
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 450 450"
      xmlSpace="preserve"
    >
      <g id="XMLID_15_">
        <path
          id="XMLID_898_"
          d="M383.757,214.898l-44.177-47.332l80.217,0.047V167.5H420v-55c0-30.327-24.673-55-55-55H55
            c-30.327,0-55,24.673-55,55v180c0,29.278,22.997,53.279,51.875,54.905C58.521,373.303,82.06,392.5,110,392.5
            c27.906,0,51.424-19.15,58.102-45h113.797c6.678,25.85,30.195,45,58.102,45c27.906,0,51.424-19.15,58.102-45H445h5v-105
            L383.757,214.898z M340.481,212.5H300v-43.372L340.481,212.5z M140,332.5c0,16.542-13.458,30-30,30s-30-13.458-30-30
            s13.458-30,30-30S140,315.958,140,332.5z M370,332.5c0,16.542-13.458,30-30,30s-30-13.458-30-30s13.458-30,30-30
            S370,315.958,370,332.5z M398.102,317.5c-6.678-25.85-30.195-45-58.102-45c-27.906,0-51.424,19.15-58.102,45H168.102
            c-6.678-25.85-30.195-45-58.102-45c-27.836,0-51.302,19.057-58.047,44.808C39.601,315.799,30,305.254,30,292.5v-180
            c0-13.785,11.215-25,25-25h310c13.785,0,25,11.215,25,25v25h-0.203H225v30h45v75h102l48,20v55H398.102z"
        />
        <path
          id="XMLID_904_"
          d="M84.917,242.5h90v-100h-90V242.5z M114.917,172.5h30v40h-30V172.5z"
        />
      </g>
    </svg>
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
function SUVIcon(props) {
  return (
    <svg
      {...props}
      fill="#000000"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width="800px"
      height="800px"
      viewBox="0 0 260 140"
      enableBackground="new 0 0 260 140"
      xmlSpace="preserve"
    >
      <path d="M246,90.011V59.995c0-5.523-4.48-9.995-10-9.995h-50L156.97,6.416C155.11,3.634,152.34,2,149,2H28
        c-5.52,0-10,4.446-10,9.969V30h-8c-4.42,0-8,3.56-8,7.983v40.022C2,82.427,5.58,86,10,86h8v20h16.458
        c2.8-15.959,16.702-28.066,33.462-28.066c16.75,0,30.708,12.107,33.518,28.066h72.958c2.8-15.959,16.764-28.066,33.524-28.066
        c16.75,0,30.624,12.107,33.434,28.066H250c4.42,0,8-3.563,8-7.985v-8.004H246z M86,50H30V13.97h56V50z M98,50V13.97h48L170,50H98z
        M68,138c-14.336,0-26.083-11.706-26.083-26.051s11.664-26.014,26-26.014s26,11.669,26,26.014S82.336,138,68,138z M67.917,99.943
        c-6.617,0-12,5.386-12,12.006c0,6.621,5.383,12.006,12,12.006s12-5.386,12-12.006C79.917,105.329,74.534,99.943,67.917,99.943z
        M208,138c-14.337,0-26.083-11.706-26.083-26.051s11.663-26.014,26-26.014s26,11.669,26,26.014S222.337,138,208,138z
        M207.917,99.943c-6.617,0-12,5.386-12,12.006c0,6.621,5.383,12.006,12,12.006s12-5.386,12-12.006
        C219.917,105.329,214.534,99.943,207.917,99.943z"/>
    </svg>
  );
}



function LimoIcon(props) {
  return (
    <svg
      {...props}
      fill="#000000"
      width="800px"
      height="800px"
      viewBox="0 -43.14 122.88 122.88"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ enableBackground: "new 0 0 122.88 36.6",transform:"scaleX(-1)" }}
      xmlSpace="preserve"
    >
      <style type="text/css">
        {".st0{fill-rule:evenodd;clip-rule:evenodd;}"}
      </style>
      <g>
        <path
          className="st0"
          d="M0,23.97c0.29-1.63,1.11-2.63,2.72-2.69c-0.14-1.7,0.18-3.13,0.92-4.31c0.35-0.55,0.79-1.04,1.33-1.47 c1.87-1.52,3.99-1.68,6.3-2.1c2.24-0.41,4.48-0.75,6.71-1.01c2.7-0.32,5.41-0.53,8.12-0.61c1.25-0.04,0.95,0.03,1.95-0.73 c4.87-3.76,10.17-6.85,15.72-9.52C45.7,0.55,48.18,0.08,51.09,0C56.91,0,80,0,85.82,0c3.85,0.02,7.13,0.9,9.88,2.56l10.58,8.14 c3.53,0.23,7.05,0.46,10.58,0.7c2.16-0.06,3.81,0.68,4.44,3.02v7.15c2.99,0.77,1.04,7.66-0.3,9.17c-1.18,1.33-2.26,1.18-3.84,1.18 h-9.43c1.81-13.63-12.08-16.54-17.8-9.12c-1.89,2.45-2.18,5.79-1.39,9.72H28.45c2.19-10.1-4.33-14.21-10.33-13.62 c-7.72,0.76-9.75,6.95-8.42,13.74H3.01C1.11,32.72,0.22,31.2,0,28.63V23.97L0,23.97z M20.04,25.27v2.76h2.76 C22.47,26.68,21.4,25.61,20.04,25.27L20.04,25.27z M22.8,29.83h-2.76v2.76C21.4,32.26,22.47,31.19,22.8,29.83L22.8,29.83z M19.15,32.7h-0.02h0.01H19.15L19.15,32.7z M18.24,32.59v-2.76h-2.76C15.81,31.19,16.88,32.26,18.24,32.59L18.24,32.59z M15.48,28.03h2.76v-2.76C16.88,25.61,15.81,26.67,15.48,28.03L15.48,28.03z M98.8,25.27v2.76h2.76 C101.23,26.68,100.16,25.61,98.8,25.27L98.8,25.27z M101.67,28.92v0.02l0-0.01L101.67,28.92L101.67,28.92z M101.57,29.83H98.8v2.76 C100.16,32.26,101.23,31.19,101.57,29.83L101.57,29.83z M97.92,32.7h-0.02h0.01H97.92L97.92,32.7z M97.01,32.59v-2.76h-2.76 C94.58,31.19,95.65,32.26,97.01,32.59L97.01,32.59z M94.24,28.03h2.76v-2.76C95.65,25.61,94.58,26.67,94.24,28.03L94.24,28.03z M33.07,10.7V14h20.09l1.56-11.48h-4.58c-3.65,0.43-4.24,0.55-7.55,2.31c-2.73,1.45-5.22,3.04-7.87,4.77 C34.17,9.96,33.61,10.33,33.07,10.7L33.07,10.7z M77.54,2.39l-1.73,11.62h11.53l2.37-2.57L91,10.04c-0.12-6.79-0.93-7.55-6.95-7.58 L77.54,2.39L77.54,2.39z M58.08,2.39l-1.73,11.62h15.37l1.52-11.53L58.08,2.39L58.08,2.39z M19.14,21.27 c4.23,0,7.67,3.43,7.67,7.67c0,4.23-3.43,7.67-7.67,7.67c-4.23,0-7.67-3.43-7.67-7.67C11.47,24.7,14.9,21.27,19.14,21.27 L19.14,21.27z M97.9,21.27c4.23,0,7.67,3.43,7.67,7.67c0,4.23-3.43,7.67-7.67,7.67c-4.23,0-7.67-3.43-7.67-7.67 C90.24,24.7,93.67,21.27,97.9,21.27L97.9,21.27z"
        />
      </g>
    </svg>
  );
}


function ChevronLeftIcon(props) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>)
  );
}


function ChevronRightIcon(props) {
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
      <path d="m9 18 6-6-6-6" />
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


function SirenIcon(props) {
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
      <path d="M7 18v-6a5 5 0 1 1 10 0v6" />
      <path
        d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" />
      <path d="M21 12h1" />
      <path d="M18.5 4.5 18 5" />
      <path d="M2 12h1" />
      <path d="M12 2v1" />
      <path d="m4.929 4.929.707.707" />
      <path d="M12 12v6" />
    </svg>)
  );
}


function XIcon(props) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>)
  );
}
function StarIcon(props) {
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
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>)
  );
}
