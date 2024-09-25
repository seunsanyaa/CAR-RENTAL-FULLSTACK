"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Badge } from "@/app/ui/oldui/badge"
import { Button } from "@/app/ui/oldui/button"
import { Checkbox } from "@/app/ui/oldui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/ui/oldui/select"
import { Input } from "@/app/ui/oldui/input"

// Type definitions for vehicle and filters
type Vehicle = {
  id: number
  make: string
  model: string
  features: string[]
  price: number
  image: string
  location?: string // Location is optional in the vehicle object
}

type Filters = {
  accessibility: string[]
  make: string
  model: string
  location: string
}

export default function Access1() {
  const [filters, setFilters] = useState<Filters>({
    accessibility: [],
    make: "",
    model: "",
    location: "",
  })

  const accessibleVehicles: Vehicle[] = [
    {
      id: 1,
      make: "Toyota",
      model: "Sienna",
      features: ["Wheelchair accessible", "Hand controls"],
      price: 59.99,
      image: "/placeholder.svg",
    },
    {
      id: 2,
      make: "Honda",
      model: "Odyssey",
      features: ["Wheelchair accessible", "Hearing impaired features"],
      price: 64.99,
      image: "/placeholder.svg",
    },
    {
      id: 3,
      make: "Dodge",
      model: "Grand Caravan",
      features: ["Wheelchair accessible", "Visually impaired features"],
      price: 54.99,
      image: "/placeholder.svg",
    },
    {
      id: 4,
      make: "Ford",
      model: "Explorer",
      features: ["Hand controls"],
      price: 49.99,
      image: "/placeholder.svg",
    },
    {
      id: 5,
      make: "Chrysler",
      model: "Pacifica",
      features: ["Wheelchair accessible", "Hearing impaired features", "Visually impaired features"],
      price: 69.99,
      image: "/placeholder.svg",
    },
  ]

  const filteredVehicles = useMemo(() => {
    return accessibleVehicles.filter((vehicle) => {
      if (
        filters.accessibility.length > 0 &&
        !filters.accessibility.every((feature) => vehicle.features.includes(feature))
      ) {
        return false
      }
      if (filters.make && vehicle.make !== filters.make) {
        return false
      }
      if (filters.model && vehicle.model !== filters.model) {
        return false
      }
      if (filters.location && vehicle.location !== filters.location) {
        return false
      }
      return true
    })
  }, [filters])

  const handleFilterChange = (type: keyof Filters, value: string) => {
    if (type === "accessibility") {
      setFilters((prevFilters) => {
        const newAccessibility = prevFilters.accessibility.includes(value)
          ? prevFilters.accessibility.filter((feature) => feature !== value)
          : [...prevFilters.accessibility, value]

        return {
          ...prevFilters,
          accessibility: newAccessibility,
        }
      })
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [type]: value,
      }))
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="#" className="text-2xl font-bold" prefetch={false}>
            Accessible Rentals
          </Link>
          <nav className="flex gap-4">
            <Link href="#" className="hover:underline" prefetch={false}>
              Browse
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Deals
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              About
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-background text-foreground py-8 px-6">
        <div className="container mx-auto">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Accessible Vehicle Browse</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-card rounded-lg shadow-md overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                    style={{ aspectRatio: "300/200", objectFit: "cover" }}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vehicle.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">${vehicle.price}/day</span>
                      <Button>Reserve</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Accessible Vehicle Filter and Search</h2>
            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="accessibility" className="block font-bold mb-2">
                    Accessibility Features
                  </label>
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <Checkbox value="Wheelchair accessible">Wheelchair accessible</Checkbox>
                      <Checkbox value="Hand controls">Hand controls</Checkbox>
                      <Checkbox value="Hearing impaired features">Hearing impaired features</Checkbox>
                      <Checkbox value="Visually impaired features">Visually impaired features</Checkbox>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="make" className="block font-bold mb-2">
                    Make
                  </label>
                  <Select id="make" value={filters.make} onValueChange={(value) => handleFilterChange("make", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Toyota">Toyota</SelectItem>
                      <SelectItem value="Honda">Honda</SelectItem>
                      <SelectItem value="Dodge">Dodge</SelectItem>
                      <SelectItem value="Ford">Ford</SelectItem>
                      <SelectItem value="Chrysler">Chrysler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="model" className="block font-bold mb-2">
                    Model
                  </label>
                  <Select id="model" value={filters.model} onValueChange={(value) => handleFilterChange("model", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sienna">Sienna</SelectItem>
                      <SelectItem value="Odyssey">Odyssey</SelectItem>
                      <SelectItem value="Grand Caravan">Grand Caravan</SelectItem>
                      <SelectItem value="Explorer">Explorer</SelectItem>
                      <SelectItem value="Pacifica">Pacifica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6">
                <label htmlFor="location" className="block font-bold mb-2">
                  Location
                </label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
            </div>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Accessible Vehicle Deals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg shadow-md overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Accessible Vehicle Deal"
                  className="w-full h-48 object-cover"
                  style={{ aspectRatio: "300/200", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Exclusive Deal on Wheelchair Accessible Vans</h3>
                  <p className="text-sm mb-4">Get 15% off your first rental of a wheelchair accessible van.</p>
                  <Button>Reserve Now</Button>
                </div>
              </div>
              <div className="bg-card rounded-lg shadow-md overflow-hidden">
                <img
                  src="/placeholder.svg"
                  alt="Accessible Vehicle Deal"
                  className="w-full h-48 object-cover"
                  style={{ aspectRatio: "300/200", objectFit: "cover" }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Discount on Hand-Controlled Cars</h3>
                  <p className="text-sm mb-4">Save 10% when you rent a car equipped with hand controls.</p>
                  <Button>Reserve Now</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
