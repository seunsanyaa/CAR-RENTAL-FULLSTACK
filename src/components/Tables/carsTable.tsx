"use client"

import CarAdd from "@/components/Tables/CarAdd";
import type { Car } from "@/types/car";
import axios from "axios";
import { ChevronDown, ChevronUp, Copy, Car as CarIconLucide, Crown, Accessibility } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface Fleet {
  _id: string;
  model: string;
  maker: string;
  trim: string;
  year: number;
  registrationNumber: string[];
  quantity: number;
  type?: 'normal' | 'golden' | 'accessibility';
}

// Define the properties we need from Car type
interface CarWithStatus extends Omit<Car, 'disabled'> {
  golden?: boolean;
  disabled?: boolean;
}

const CarsTable = () => {
  const [carData, setCarData] = useState<CarWithStatus[]>([]);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleetType, setSelectedFleetType] = useState<'all' | 'normal' | 'golden' | 'accessibility'>('all');
  const [editingCar, setEditingCar] = useState<CarWithStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFleets, setExpandedFleets] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditingCar, setIsEditingCar] = useState(false);
  const [cloningCar, setCloningCar] = useState<CarWithStatus | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  const fetchFleets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get fleets with car information
      const fleetResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "analytics:getAllFleets",
        args: {}
      });

      if (fleetResponse.data) {
        const processedFleets = fleetResponse.data.value || [];
        
        // Check for empty fleets and delete them
        const emptyFleetIds = processedFleets[0]?.emptyFleetIds;
        if (emptyFleetIds && emptyFleetIds.length > 0) {
          await axios.post(`${API_BASE_URL}/mutation`, {
            path: "analytics:deleteEmptyFleets",
            args: { fleetIds: emptyFleetIds }
          });
        }

        setFleets(processedFleets);
        
        // Extract all cars from the fleets
        const allCars = processedFleets.reduce((acc: CarWithStatus[], fleet: Fleet & { cars?: CarWithStatus[] }) => {
          return [...acc, ...(fleet.cars || [])];
        }, []);
        setCarData(allCars);
      }
    } catch (err) {
      console.error('Error fetching fleets:', err);
      setError('Failed to fetch fleets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "car:getAllCars",
        args: selectedFleetType === 'all' ? {} : {
          golden: selectedFleetType === 'golden' ? true : undefined,
          disabled: selectedFleetType === 'accessibility' ? true : undefined
        }
      });
      if (response.data) {
        // For normal fleet, filter out golden and disabled cars
        if (selectedFleetType === 'normal') {
          setCarData(response.data.value.filter((car: CarWithStatus) => !car.golden && !car.disabled));
        } else {
          setCarData(response.data.value);
        }
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleets();
    fetchCars();
  }, [selectedFleetType]);

  const toggleFleet = (fleetId: string) => {
    setExpandedFleets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fleetId)) {
        newSet.delete(fleetId);
      } else {
        newSet.add(fleetId);
      }
      return newSet;
    });
  };

  const getFleetIcon = (type: Fleet['type']) => {
    switch (type) {
      case 'normal':
        return <CarIconLucide className="h-6 w-6" />;
      case 'golden':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'accessibility':
        return <Accessibility className="h-6 w-6 text-blue-500" />;
    }
  };

  const getFleetColor = (type: Fleet['type']) => {
    switch (type) {
      case 'normal':
        return 'bg-gray-100 dark:bg-gray-800';
      case 'golden':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'accessibility':
        return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };
  
  const handleDelete = async (registrationNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      // Delete the car first
      await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:deleteCar",
        args: { registrationNumber }
      });
      
      try {
        // Try to cleanup empty fleets, but don't fail if it errors
        await axios.post(`${API_BASE_URL}/mutation`, {
          path: "analytics:cleanupEmptyFleets"
        });
      } catch (cleanupErr) {
        console.error('Error cleaning up fleets:', cleanupErr);
        // Don't set error or throw - we still want to refresh the UI
      }
      
      // Refresh the UI regardless of cleanup success
      fetchFleets();
      fetchCars();
    } catch (err) {
      console.error('Error deleting car:', err);
      setError('Failed to delete car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car: CarWithStatus) => {
    setEditingCar({ ...car });
    setIsEditingCar(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingCar) return;
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    let updatedValue: any;

    if (name === "pictures") {
      updatedValue = value.split(",").map((url) => url.trim());
    } else if (name === "pricePerDay") {
      updatedValue = parseFloat(value);
    } else if (name === "available" || name === "disabled") {
      updatedValue = checked;
    } else if (name === "year") {
      updatedValue = parseInt(value);
    } else {
      updatedValue = value;
    }

    setEditingCar({
      ...editingCar,
      [name]: updatedValue,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingCar) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "car:updateCar",
          args: {
            registrationNumber: editingCar.registrationNumber,
            model: editingCar.model,
            trim: editingCar.trim,
            color: editingCar.color,
            maker: editingCar.maker,
            lastMaintenanceDate: editingCar.lastMaintenanceDate,
            available: editingCar.available,
            year: editingCar.year,
            disabled: editingCar.disabled,
            pictures: editingCar.pictures,
            pricePerDay: editingCar.pricePerDay,
          }
        });
        if (response.data) {
          fetchCars(); // Fetch all cars again after successful update
          setEditingCar(null);
          setIsEditingCar(false);
        }
      } catch (err) {
        console.error('Error updating car:', err);
        setError('Failed to update car. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyBooking = (car: CarWithStatus) => {
    const carForClone = {
      ...car,
      disabled: car.disabled || false
    };
    setCloningCar(null); // Reset first to ensure state change
    setTimeout(() => setCloningCar(carForClone), 0); // Set in next tick
  };

  const toggleRow = (registrationNumber: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(registrationNumber)) {
        newSet.delete(registrationNumber);
      } else {
        newSet.add(registrationNumber);
      }
      return newSet;
    });
  };

  const handleCarAdded = (car: Car) => {
    if (Object.keys(car).length > 0) {
      fetchFleets();
      fetchCars();
    }
    setCloningCar(null);
  };

  const filteredFleets = fleets.filter(fleet => {
    if (selectedFleetType === 'all') return true;
    return fleet.type === selectedFleetType;
  });

  const handleToggleAvailability = async (car: CarWithStatus) => {
    try {
      await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:updateCar",
        args: {
          registrationNumber: car.registrationNumber,
          available: !car.available
        }
      });
      fetchFleets();
      fetchCars();
    } catch (err) {
      console.error('Error toggling car availability:', err);
      setError('Failed to update car status. Please try again.');
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-xl font-semibold text-black dark:text-white">Fleet Management</h4>
          <div className="flex gap-2">
            <CarAdd onCarAdded={handleCarAdded} />
            {cloningCar && (
              <CarAdd 
                onCarAdded={handleCarAdded} 
                initialData={cloningCar} 
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedFleetType === 'all' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFleetType('all')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">All Fleets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fleets.length}</div>
              <p className="text-sm text-muted-foreground">Total Fleets</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedFleetType === 'normal' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFleetType('normal')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <CarIconLucide className="h-5 w-5" />
                <CardTitle className="text-lg">Normal Fleet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fleets.filter(fleet => fleet.type === 'normal').length}
              </div>
              <p className="text-sm text-muted-foreground">Standard Fleets</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedFleetType === 'golden' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFleetType('golden')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Golden Fleet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fleets.filter(fleet => fleet.type === 'golden').length}
              </div>
              <p className="text-sm text-muted-foreground">Premium Fleets</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedFleetType === 'accessibility' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFleetType('accessibility')}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Accessibility className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Accessibility Fleet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fleets.filter(fleet => fleet.type === 'accessibility').length}
              </div>
              <p className="text-sm text-muted-foreground">Accessible Fleets</p>
            </CardContent>
          </Card>
      </div>
      
        {loading && (
          <div className="flex items-center justify-center p-8">
            <p className="text-lg">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setError(null);
                fetchFleets();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && fleets.length === 0 && (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No fleets found</p>
          </div>
        )}

        {!loading && !error && fleets.length > 0 && (
          <div className="space-y-4">
            {filteredFleets.map((fleet) => {
              // Get all cars in this fleet
              const fleetCars = carData.filter(car => 
                fleet.registrationNumber.includes(car.registrationNumber)
              );
              
              // Count active cars separately
              const activeCars = fleetCars.filter(car => car.available);
              
              return (
                <div 
                  key={fleet._id}
                  className={`rounded-lg border ${getFleetColor(fleet.type || 'normal')} p-4`}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleFleet(fleet._id)}
                  >
                    <div className="flex items-center space-x-3">
                      {getFleetIcon(fleet.type || 'normal')}
                      <div>
                        <h3 className="text-lg font-semibold">{fleet.maker} {fleet.model} Fleet</h3>
                        <p className="text-sm text-gray-500">
                          {fleetCars.length} vehicles ({activeCars.length} active)
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedFleets.has(fleet._id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {expandedFleets.has(fleet._id) && (
                    <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-left">
                <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Image</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Model</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Trim</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Maker</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Reg. Number</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Price per Day</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
                            {fleetCars.map((car) => (
                <React.Fragment key={car.registrationNumber}>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(car.registrationNumber)}
                      >
                        {expandedRows.has(car.registrationNumber) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                                  <td className="py-3 px-4">
                                    <Badge 
                                      variant={car.available ? "default" : "destructive"}
                                      className="cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => handleToggleAvailability(car)}
                                    >
                                      {car.available ? "Active" : "Inactive"}
                                    </Badge>
                                  </td>
                    <td className="py-3 px-4">
                      {car.pictures && car.pictures.length > 0 ? (
                        <Image 
                          src={car.pictures[0]} 
                          alt={`${car.maker} ${car.model}`}
                          width={50}
                          height={50}
                          className="rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/path/to/fallback-image.jpg"
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{car.model}</td>
                    <td className="py-3 px-4">{car.trim}</td>
                    <td className="py-3 px-4">{car.maker}</td>
                    <td className="py-3 px-4">{car.registrationNumber}</td>
                    <td className="py-3 px-4">{car.pricePerDay}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Sheet open={isEditingCar} onOpenChange={setIsEditingCar}>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>
                            Edit
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                          <div className="h-full flex flex-col">
                            <SheetHeader>
                              <SheetTitle>Edit Car</SheetTitle>
                              <SheetDescription>
                                Make changes to the car details below. Click &quot;Save&quot; when you&apos;re done.
                              </SheetDescription>
                            </SheetHeader>
                            {editingCar && (
                              <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                                <div>
                                  <label htmlFor="model" className="text-sm font-medium">Model</label>
                                  <Input
                                    id="model"
                                    name="model"
                                    value={editingCar.model}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="trim" className="text-sm font-medium">Trim</label>
                                  <Input
                                    id="trim"
                                    name="trim"
                                    value={editingCar.trim}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                                  <Input
                                    id="color"
                                    name="color"
                                    value={editingCar.color}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="maker" className="text-sm font-medium">Maker</label>
                                  <Input
                                    id="maker"
                                    name="maker"
                                    value={editingCar.maker}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="lastMaintenanceDate" className="text-sm font-medium">Last Maintenance Date</label>
                                  <Input
                                    id="lastMaintenanceDate"
                                    name="lastMaintenanceDate"
                                    type="date"
                                    value={editingCar.lastMaintenanceDate}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <label htmlFor="available" className="text-sm font-medium mr-2">Available</label>
                                  <input
                                    id="available"
                                    name="available"
                                    type="checkbox"
                                    checked={editingCar.available}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="year" className="text-sm font-medium">Year</label>
                                  <Input
                                    id="year"
                                    name="year"
                                    type="number"
                                    value={editingCar.year}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number</label>
                                  <Input
                                    id="registrationNumber"
                                    name="registrationNumber"
                                    value={editingCar.registrationNumber}
                                    onChange={handleInputChange}
                                    disabled
                                  />
                                </div>
                                <div>
                                  <label htmlFor="pictures" className="text-sm font-medium">Picture URLs (comma-separated)</label>
                                  <Input
                                    id="pictures"
                                    name="pictures"
                                    value={editingCar.pictures.join(", ")}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="pricePerDay" className="text-sm font-medium">Price per Day</label>
                                  <Input
                                    id="pricePerDay"
                                    name="pricePerDay"
                                    type="number"
                                    value={editingCar.pricePerDay}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                {error && <p className="text-red-500">{error}</p>}
                                <div className="mt-4">
                                  <Button
                                    type="submit"
                                    className="text-white w-full"
                                    disabled={loading}
                                  >
                                    {loading ? "Saving..." : "Save Changes"}
                                  </Button>
                                </div>
                              </form>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(car.registrationNumber)}
                      >
                        Delete
                      </Button>
                      <Link href={`/cars/${car.registrationNumber}`}>
                        <Button variant="link" size="sm">View</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyBooking(car)}
                        className="mr-2"
                      >
                        Clone
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(car.registrationNumber) && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                                    <td colSpan={9} className="py-3 px-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Color:</strong> {car.color}</p>
                            <p><strong>Year:</strong> {car.year}</p>
                            <p><strong>Last Maintenance:</strong> {car.lastMaintenanceDate}</p>
                            <p><strong>Trim:</strong> {car.trim}</p>
                          </div>
                          <div>
                                          <p><strong>Status:</strong> {car.available ? "Active" : "Inactive"}</p>
                            <p><strong>Disabled:</strong> {car.disabled ? "Yes" : "No"}</p>
                                          <p><strong>Golden:</strong> {car.golden ? "Yes" : "No"}</p>
                            <p><strong>Categories:</strong> {car.categories?.join(", ") || "No categories"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
      </div>
    </div>
  );
};

export default CarsTable;
