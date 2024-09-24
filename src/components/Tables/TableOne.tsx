"use client"

import { Fleet } from "@/types/fleet";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

const initialFleetData: Fleet[] = [
  {

    name: 'Tesla',
    model: 'Model 8',
    carCount: 10,
    averageMileage: 25,
    fuelType: 'petrol',
  },
  {
    
    name: 'Ford',
    model: 'Mustang',
    carCount: 15,
    averageMileage: 20,
    fuelType: 'diesel',
  },
  {
    
    name: 'Chevrolet',
    model: 'Bolt',
    carCount: 8,
    averageMileage: 30,
    fuelType: 'electric',
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
  });

  const handleDelete = (name: string) => {
    setFleetData(fleetData.filter(fleet => fleet.name !== name));
  };

  const handleEdit = (fleet: Fleet) => {
    setEditingFleet({ ...fleet });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingFleet(prev => {
      if (!prev) return null;
      return { ...prev, [name]: name === 'carCount' || name === 'averageMileage' ? parseInt(value) : value };
    });
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
     <Button>
        Add Fleet
      </Button>      
      
          </SheetTrigger>
          <SheetContent className="bg-white z-99999">
            <SheetHeader>
              <SheetTitle>Add New Fleet</SheetTitle>
              <SheetDescription>
                Enter the details of the new fleet below. Click &quot;Add&quot; to save.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleAddFleetSubmit} className="space-y-4 mt-4">
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
              <Button type="submit" className="text-white">Add Fleet</Button>
            </form>
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
                  <Button variant="outline" size="sm" onClick={() => handleEdit(fleet)}>
                    Edit
                  </Button>
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
              <Button variant="destructive" size="sm" onClick={() => handleDelete(fleet.name)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;