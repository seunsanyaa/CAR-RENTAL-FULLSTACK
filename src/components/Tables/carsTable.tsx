"use client"

import { Car } from "@/types/car";
import axios from "axios";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
import Image from 'next/image';
import CarAdd from "@/components/Tables/CarAdd"; // Import the new CarAdd component

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const CarsTable = () => {
  const [carData, setCarData] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditingCar, setIsEditingCar] = useState(false);

  const handleDelete = async (registrationNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:deleteCar",
        args: { registrationNumber }
      });
      if (response.data) {
        setCarData(carData.filter((car) => car.registrationNumber !== registrationNumber));
      }
    } catch (err) {
      console.error('Error deleting car:', err);
      setError('Failed to delete car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car: Car) => {
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
          setCarData(
            carData.map((car) =>
              car.registrationNumber === editingCar.registrationNumber ? editingCar : car
            )
          );
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

  const fetchCars = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "car:getAllCars",
        args: {},
        format: "json" 
      });
      if (response.data) {
        console.log(response.data);
        setCarData(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch cars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // Removed dependency on newCar as it's now handled by CarAdd
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopyCar = (car: Car) => {
    // Logic to handle copying a car can remain here or be moved to CarAdd if desired
    // For simplicity, it's retained here
    // You might consider prompting the user to edit the copied car details
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
    setCarData([...carData, car]);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Cars Overview</h4>
        <CarAdd onCarAdded={handleCarAdded} /> {/* Use the new CarAdd component */}
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
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
              {carData.map((car) => (
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
                                Make changes to the car details below. Click "Save" when you're done.
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
                      <Button variant="outline" size="sm" onClick={() => handleCopyCar(car)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Clone
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(car.registrationNumber) && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={8} className="py-3 px-4"> {/* Updated colspan to 8 to match headers */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Color:</strong> {car.color}</p>
                            <p><strong>Year:</strong> {car.year}</p>
                            <p><strong>Last Maintenance:</strong> {car.lastMaintenanceDate}</p>
                            <p><strong>Trim:</strong> {car.trim}</p>
                          </div>
                          <div>
                            <p><strong>Available:</strong> {car.available ? "Yes" : "No"}</p>
                            <p><strong>Disabled:</strong> {car.disabled ? "Yes" : "No"}</p>
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
      )}
    </div>
  );
};

export default CarsTable;
