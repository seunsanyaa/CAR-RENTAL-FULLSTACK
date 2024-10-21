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

const API_BASE_URL = 'https://third-elk-244.convex.cloud/api';
const CAR_QUERY_API_BASE = 'https://www.carqueryapi.com/api/0.3/';

const CarsTable = () => {
  const [carData, setCarData] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState({
    model: "",
    color: "",
    maker: "",
    trim: "",
    lastMaintenanceDate: "",
    available: false,
    year: 0,
    disabled: false,
    registrationNumber: "",
    pictures: [] as string[],
    pricePerDay: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditingCar, setIsEditingCar] = useState(false);

  // State variables for dynamic dropdowns
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableTrims, setAvailableTrims] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  // Fetch available makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await axios.get(`${CAR_QUERY_API_BASE}?cmd=getMakes&callback=`);
        console.log('Makes Response:', response.data); // Debugging
        const makes = response.data.Makes.map((make: any) => make.make_display);
        setAvailableMakes(makes);
      } catch (err) {
        console.error('Error fetching makes:', err);
        setError('Failed to fetch makes. Please try again later.');
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when maker changes
  useEffect(() => {
    const fetchModels = async () => {
      if (newCar.maker.trim() === "") {
        setAvailableModels([]);
        return;
      }
      try {
        const response = await axios.get(`${CAR_QUERY_API_BASE}?cmd=getModels&make=${encodeURIComponent(newCar.maker)}&callback=`);
        console.log('Models Response:', response.data); // Debugging
        const models = response.data.Models.map((model: any) => model.model_name);
        setAvailableModels(models);
      } catch (err) {
        console.error('Error fetching models:', err);
        setError('Failed to fetch models. Please try again later.');
      }
    };
    fetchModels();
  }, [newCar.maker]);

  // Fetch trims and years when model changes
  useEffect(() => {
    const fetchTrimsAndYears = async () => {
      if (newCar.maker.trim() === "" || newCar.model.trim() === "") {
        setAvailableTrims([]);
        setAvailableYears([]);
        return;
      }
      setFetchingOptions(true);
      try {
        const response = await axios.get(`${CAR_QUERY_API_BASE}?cmd=getTrims&make=${encodeURIComponent(newCar.maker)}&model=${encodeURIComponent(newCar.model)}&callback=`);
        console.log('Trims and Years Response:', response.data); // Debugging
        const trims = response.data.Trims.map((trim: any) => trim.model_trim).filter((trim: string) => trim);
        const years = response.data.Trims.map((trim: any) => parseInt(trim.model_year)).filter((year: number) => !isNaN(year));
        // Remove duplicates
        const uniqueTrims = Array.from(new Set(trims));
        const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a);
        setAvailableTrims(uniqueTrims);
        setAvailableYears(uniqueYears);
      } catch (err) {
        console.error('Error fetching trims and years:', err);
        setError('Failed to fetch trims and years. Please try again later.');
      } finally {
        setFetchingOptions(false);
      }
    };
    fetchTrimsAndYears();
  }, [newCar.maker, newCar.model]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    if (name === "pictures") {
      setNewCar((prev) => ({
        ...prev,
        pictures: value.split(',').map(url => url.trim()),
      }));
    } else if (name === "pricePerDay") {
      setNewCar((prev) => ({
        ...prev,
        pricePerDay: parseFloat(value) || 0,
      }));
    } else if (name === "year") {
      setNewCar((prev) => ({
        ...prev,
        year: parseInt(value) || 0,
      }));
    } else if (name === "trim") {
      setNewCar((prev) => ({
        ...prev,
        trim: value,
      }));
    } else {
      setNewCar((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "year"
            ? parseInt(value) || 0
            : value,
      }));
    }

    if (editingCar) {
      setEditingCar((prev: Car | null) =>
        prev
          ? {
              ...prev,
              [name]:
                name === "pictures"
                  ? value.split(',').map(url => url.trim())
                  : name === "pricePerDay"
                  ? parseFloat(value) || 0
                  : type === "checkbox"
                  ? checked
                  : name === "year"
                  ? parseInt(value) || 0
                  : value,
            }
          : null
      );
    }
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
            color: editingCar.color,
            maker: editingCar.maker,
            trim: editingCar.trim, // Include trim in the update
            lastMaintenanceDate: editingCar.lastMaintenanceDate,
            available: editingCar.available,
            year: editingCar.year,
            disabled: editingCar.disabled,
            pictures: editingCar.pictures,
            pricePerDay: editingCar.pricePerDay,
          }
        });
        if (response.data) {
          setCarData(carData.map((car) =>
            car.registrationNumber === editingCar.registrationNumber ? editingCar : car
          ));
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
        console.log('Fetch Cars Response:', response.data); // Debugging
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
  }, [newCar]);

  const handleAddCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:createCar",
        args: {
          model: newCar.model,
          color: newCar.color,
          maker: newCar.maker,
          trim: newCar.trim, // Include trim in the creation
          lastMaintenanceDate: newCar.lastMaintenanceDate,
          available: newCar.available,
          year: newCar.year,
          registrationNumber: newCar.registrationNumber,
          pictures: newCar.pictures,
          pricePerDay: newCar.pricePerDay,
        }
      });
      if (response.data) {
        setCarData([...carData, response.data]);
        setNewCar({
          model: "",
          color: "",
          maker: "",
          trim: "",
          lastMaintenanceDate: "",
          available: false,
          year: 0,
          disabled: false,
          registrationNumber: "",
          pictures: [],
          pricePerDay: 0,
        });
        setIsAddingCar(false);
      }
    } catch (err) {
      console.error('Error adding car:', err);
      setError('Failed to add car. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCar = (car: Car) => {
    setNewCar({
      ...car,
      registrationNumber: '',
      trim: "",
      pictures: [...car.pictures],
      pricePerDay: 0,
    });
    setIsAddingCar(true);
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

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Cars Overview</h4>
        <Sheet open={isAddingCar} onOpenChange={setIsAddingCar}>
          <SheetTrigger asChild>
            <Button variant="default" className="text-white">Add Car</Button>
          </SheetTrigger>
          <SheetContent>
            <div className="h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>Add New Car</SheetTitle>
                <SheetDescription>
                  Enter the details of the new car below. Click &quot;Add&quot; to save.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleAddCarSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                <div>
                  <label htmlFor="maker" className="text-sm font-medium">Maker</label>
                  <select
                    id="maker"
                    name="maker"
                    value={newCar.maker}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value="">Select Maker</option>
                    {availableMakes.map((make) => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="model" className="text-sm font-medium">Model</label>
                  <select
                    id="model"
                    name="model"
                    value={newCar.model}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value="">Select Model</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="trim" className="text-sm font-medium">Trim</label>
                  <select
                    id="trim"
                    name="trim"
                    value={newCar.trim}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value="">Select Trim</option>
                    {availableTrims.map((trim) => (
                      <option key={trim} value={trim}>{trim}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year" className="text-sm font-medium">Year</label>
                  <select
                    id="year"
                    name="year"
                    value={newCar.year}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded p-2"
                  >
                    <option value={0}>Select Year</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                  <Input
                    id="color"
                    name="color"
                    value={newCar.color}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="lastMaintenanceDate" className="text-sm font-medium">Last Maintenance Date</label>
                  <Input
                    id="lastMaintenanceDate"
                    name="lastMaintenanceDate"
                    type="date"
                    value={newCar.lastMaintenanceDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="available" className="text-sm font-medium mr-2">Available</label>
                  <input
                    id="available"
                    name="available"
                    type="checkbox"
                    checked={newCar.available}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="registrationNumber" className="text-sm font-medium">Registration Number</label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={newCar.registrationNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="pictures" className="text-sm font-medium">Picture URLs (comma-separated)</label>
                  <Input
                    id="pictures"
                    name="pictures"
                    value={newCar.pictures.join(', ')}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="pricePerDay" className="text-sm font-medium">Price per Day</label>
                  <Input
                    id="pricePerDay"
                    name="pricePerDay"
                    type="number"
                    value={newCar.pricePerDay}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mt-4">
                  <Button type="submit" className="text-white w-full">
                    Add Car
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
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
                <th className="py-4 px-4 font-medium text-black dark:text-white">Maker</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Trim</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Year</th>
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
                    <td className="py-3 px-4">{car.maker}</td>
                    <td className="py-3 px-4">{car.trim}</td>
                    <td className="py-3 px-4">{car.year}</td>
                    <td className="py-3 px-4">{car.pricePerDay}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Sheet open={isEditingCar} onOpenChange={setIsEditingCar}>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(car)}>Edit</Button>
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
                                  <label htmlFor="maker" className="text-sm font-medium">Maker</label>
                                  <select
                                    id="maker"
                                    name="maker"
                                    value={editingCar.maker}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                  >
                                    <option value="">Select Maker</option>
                                    {availableMakes.map((make) => (
                                      <option key={make} value={make}>{make}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="model" className="text-sm font-medium">Model</label>
                                  <select
                                    id="model"
                                    name="model"
                                    value={editingCar.model}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                  >
                                    <option value="">Select Model</option>
                                    {availableModels.map((model) => (
                                      <option key={model} value={model}>{model}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="trim" className="text-sm font-medium">Trim</label>
                                  <select
                                    id="trim"
                                    name="trim"
                                    value={editingCar.trim}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                  >
                                    <option value="">Select Trim</option>
                                    {availableTrims.map((trim) => (
                                      <option key={trim} value={trim}>{trim}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="year" className="text-sm font-medium">Year</label>
                                  <select
                                    id="year"
                                    name="year"
                                    value={editingCar.year}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded p-2"
                                  >
                                    <option value={0}>Select Year</option>
                                    {availableYears.map((year) => (
                                      <option key={year} value={year}>{year}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="color" className="text-sm font-medium">Color</label>
                                  <Input
                                    id="color"
                                    name="color"
                                    value={editingCar.color}
                                    onChange={handleInputChange}
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
                                    value={editingCar.pictures.join(', ')}
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
                                  />
                                </div>
                                <div className="mt-4">
                                  <Button type="submit" className="text-white w-full">
                                    Save Changes
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
                      <td colSpan={8} className="py-3 px-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Color:</strong> {car.color}</p>
                            <p><strong>Year:</strong> {car.year}</p>
                            <p><strong>Last Maintenance:</strong> {car.lastMaintenanceDate}</p>
                          </div>
                          <div>
                            <p><strong>Available:</strong> {car.available ? "Yes" : "No"}</p>
                            <p><strong>Disabled:</strong> {car.disabled ? "Yes" : "No"}</p>
                            <p><strong>Trim:</strong> {car.trim}</p>
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
