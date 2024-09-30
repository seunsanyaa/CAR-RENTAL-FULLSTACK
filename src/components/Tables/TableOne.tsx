"use client"

import { Fleet } from "@/types/fleet";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

const initialFleetData: Fleet[] = [
  {
    name: 'Tesla',
    model: 'Model 3',
    carCount: 25,
    averageMileage: 353,
    fuelType: 'electric',
    photos: ['tesla_model3_1.jpg', 'tesla_model3_2.jpg'],
    specifications: '0-60 mph in 3.1s, 358 mile range, AWD',
    features: 'Autopilot, 15" touchscreen, Glass roof',
    pricing: '$41,190 - $53,190',
  },
  {
    name: 'Toyota',
    model: 'Prius',
    carCount: 30,
    averageMileage: 54,
    fuelType: 'hybrid',
    photos: ['toyota_prius_1.jpg', 'toyota_prius_2.jpg'],
    specifications: '1.8L 4-cylinder hybrid, 121 hp combined',
    features: 'Toyota Safety Sense 2.0, 7" touch-screen, Apple CarPlay',
    pricing: '$25,075 - $33,370',
  },
  {
    name: 'Ford',
    model: 'F-150',
    carCount: 20,
    averageMileage: 25,
    fuelType: 'gasoline',
    photos: ['ford_f150_1.jpg', 'ford_f150_2.jpg'],
    specifications: '3.3L V6, 290 hp, 10-speed automatic',
    features: 'SYNC 4, Pro Trailer Backup Assist, 12" touchscreen',
    pricing: '$30,870 - $75,835',
  },
  {
    name: 'Nissan',
    model: 'Leaf',
    carCount: 15,
    averageMileage: 226,
    fuelType: 'electric',
    photos: ['nissan_leaf_1.jpg', 'nissan_leaf_2.jpg'],
    specifications: '147 hp, 62 kWh battery, 226 mile range',
    features: 'ProPILOT Assist, e-Pedal, 8" touch-screen display',
    pricing: '$27,800 - $37,400',
  },
  {
    name: 'Honda',
    model: 'Civic',
    carCount: 35,
    averageMileage: 36,
    fuelType: 'gasoline',
    photos: ['honda_civic_1.jpg', 'honda_civic_2.jpg'],
    specifications: '2.0L 4-cylinder, 158 hp, CVT',
    features: 'Honda Sensing, 7" touch-screen, Apple CarPlay',
    pricing: '$22,350 - $29,850',
  },
];

const TableOne = () => {
  const [fleetData, setFleetData] = useState<Fleet[]>(initialFleetData);
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null);
  const [isAddingFleet, setIsAddingFleet] = useState(false);
  const [newFleet, setNewFleet] = useState({
    name: '',
    model: '',
    carCount: '',
    averageMileage: '',
    fuelType: '',
    photos: [],
    specifications: '',
    features: '',
    pricing: '',
  });

  const handleDelete = (name: string) => {
    setFleetData(fleetData.filter(fleet => fleet.name !== name));
  };

  const handleEdit = (fleet: Fleet) => {
    setEditingFleet({ ...fleet });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFleet(prev => ({
      ...prev,
      [name]: name === 'carCount' || name === 'averageMileage' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFleet(prev => ({
        ...prev,
        photos: Array.from(e.target.files!)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingFleet) {
      setFleetData(fleetData.map(fleet => fleet.name === editingFleet.name ? editingFleet : fleet));
      setEditingFleet(null);
    }
  };

  const handleAddFleetSubmit = (e:any) => {
    e.preventDefault();

    // setNewFleet({
    //   name: '',
    //   model: '',
    //   carCount: '',
    //   averageMileage: '',
    //   fuelType: '',
    // });
    setIsAddingFleet(false); // Close modal after submitting
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 min-h-[100vh]">
       
      
      <div className="flex justify-between">
   <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Fleet Overview
      </h4>
      <Sheet>
          <SheetTrigger asChild>
     <Button color="white" variant={'default'} className="text-white">
        Add Fleet
      </Button>      
      
          </SheetTrigger>
          <SheetContent className="overflow-y-auto max-h-screen">
            <div className="h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>Add New Fleet</SheetTitle>
                <SheetDescription>
                  Enter the details of the new fleet below. Click &quot;Add&quot; to save.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleAddFleetSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                <div>
                  <label htmlFor="name" className="text-sm font-medium">Brand</label>
                  <Input
                    id="name"
                    name="name"
                    value={newFleet.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="model" className="text-sm font-medium">Model</label>
                  <Input
                    id="model"
                    name="model"
                    value={newFleet.model}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="carCount" className="text-sm font-medium">Car Count</label>
                  <Input
                    id="carCount"
                    name="carCount"
                    type="number"
                    value={newFleet.carCount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="averageMileage" className="text-sm font-medium">Average Mileage</label>
                  <Input
                    id="averageMileage"
                    name="averageMileage"
                    type="number"
                    value={newFleet.averageMileage}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="fuelType" className="text-sm font-medium">Fuel Type</label>
                  <Input
                    id="fuelType"
                    name="fuelType"
                    value={newFleet.fuelType}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="photos" className="text-sm font-medium">Vehicle Photos</label>
                  <Input
                    id="photos"
                    name="photos"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
                <div>
                  <label htmlFor="specifications" className="text-sm font-medium">Specifications</label>
                  <textarea
                    id="specifications"
                    name="specifications"
                    value={newFleet.specifications}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label htmlFor="features" className="text-sm font-medium">Features</label>
                  <textarea
                    id="features"
                    name="features"
                    value={newFleet.features}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label htmlFor="pricing" className="text-sm font-medium">Pricing</label>
                  <Input
                    id="pricing"
                    name="pricing"
                    type="text"
                    value={newFleet.pricing}
                    onChange={handleInputChange}
                    placeholder="e.g., $30,000 - $45,000"
                  />
                </div>
              </form>
              <div className="mt-4">
                <Button type="submit" className="text-white w-full">Add Fleet</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      {/* <Button onClick={() => setIsAddingFleet(true)}>
        Add Fleet
      </Button> */}
      </div>
      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-7">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Brand
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Model
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Car Count
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Avg. Mileage
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Fuel Type
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
            
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
         
            </h5>
          </div>
        </div>

        {fleetData.map((fleet,index) => (
          <div
            className="grid grid-cols-3 sm:grid-cols-7 border-b border-stroke dark:border-strokedark"
            key={index}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-black dark:text-white">
                {fleet.name}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{fleet.model}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3">{fleet.carCount}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white">{fleet.averageMileage} mpg</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-meta-5">{fleet.fuelType}</p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">

        
              <Sheet>
                <SheetTrigger asChild>

                  {/* <Link href={'/fleets/id'}> */}
                    
                  <Button variant="outline" size="sm" onClick={()=>handleEdit(fleet)}>
                    Edit
                    </Button>
                    
                    {/* </Link> */}
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit Fleet</SheetTitle>
                    <SheetDescription>
                      Make changes to the fleet here. Click save when you&apos;re done.
                    </SheetDescription>
                  </SheetHeader>
                  {editingFleet && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium">Brand</label>
                        <Input
                          id="name"
                          name="name"
                          value={editingFleet.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="model" className="text-sm font-medium">Model</label>
                        <Input
                          id="model"
                          name="model"
                          value={editingFleet.model}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="carCount" className="text-sm font-medium">Car Count</label>
                        <Input
                          id="carCount"
                          name="carCount"
                          type="number"
                          value={editingFleet.carCount}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="averageMileage" className="text-sm font-medium">Average Mileage</label>
                        <Input
                          id="averageMileage"
                          name="averageMileage"
                          type="number"
                          value={editingFleet.averageMileage}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="fuelType" className="text-sm font-medium">Fuel Type</label>
                        <Input
                          id="fuelType"
                          name="fuelType"
                          value={editingFleet.fuelType}
                          onChange={handleInputChange}
                        />
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                  )}
                </SheetContent>
              </Sheet>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">

              <Link  href={'/fleets/id'}>
              
              <Button variant="link" size="sm" >
                View
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;