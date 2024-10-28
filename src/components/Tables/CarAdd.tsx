import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Copy } from "lucide-react";
import { Car } from "@/types/car";
import { fetchMakes, fetchModels, fetchTrims } from "../../api/carQueryApi";  

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface CarAddProps {
  onCarAdded: (car: Car) => void;
}

const CarAdd: React.FC<CarAddProps> = ({ onCarAdded }) => {
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [newCar, setNewCar] = useState({
    model: "",
    trim: "",
    color: "",
    maker: "",
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
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState<{ min_year: number; max_year: number }>({ min_year: 0, max_year: 0 });

  useEffect(() => {
    const minYear = 2001;
    const maxYear = 2022;
    const yearsList = Array.from({ length: maxYear - minYear + 1 }, 
      (_, i) => maxYear - i); // Create years array from max to min
    setYears(yearsList);
  }, []);

  useEffect(() => {
    if (newCar.year) {
      fetchMakes(newCar.year)
        .then((data) => {
          if (data && data.Makes) {
            const makeNames = data.Makes.map((make: any) => make.make_display);
            setMakes(makeNames);
          } else {
            setMakes([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching makes:", err);
          setError("Failed to fetch makes. Please try again.");
        });
    } else {
      setMakes([]);
    }
    setModels([]);
    setTrims([]);
    setNewCar((prev) => ({ ...prev, maker: "", model: "", trim: "" }));
  }, [newCar.year]);

  useEffect(() => {
    if (newCar.year && newCar.maker) {
      fetchModels(newCar.year, newCar.maker)
        .then((data) => {
          if (data && data.Models) {
            const modelNames = data.Models.map((model: any) => model.model_name);
            setModels(modelNames);
          } else {
            setModels([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching models:", err);
          setError("Failed to fetch models. Please try again.");
        });
    } else {
      setModels([]);
    }
    setTrims([]);
    setNewCar((prev) => ({ ...prev, model: "", trim: "" }));
  }, [newCar.year, newCar.maker]);

  useEffect(() => {
    if (newCar.year && newCar.maker && newCar.model) {
      fetchTrims(newCar.year, newCar.maker, newCar.model)
        .then((data) => {
          if (data && data.Trims) {
            const trimNames = data.Trims.map((trim: any) => trim.model_trim);
            setTrims(trimNames);
          } else {
            setTrims([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching trims:", err);
          setError("Failed to fetch trims. Please try again.");
        });
    } else {
      setTrims([]);
    }
    setNewCar((prev) => ({ ...prev, trim: "" }));
  }, [newCar.year, newCar.maker, newCar.model]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "pictures") {
      setNewCar((prev) => ({
        ...prev,
        pictures: value.split(",").map((url) => url.trim()),
      }));
    } else if (name === "pricePerDay") {
      setNewCar((prev) => ({
        ...prev,
        pricePerDay: parseFloat(value),
      }));
    } else if (name === "available" || name === "disabled") {
      setNewCar((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "year") {
      setNewCar((prev) => ({
        ...prev,
        year: parseInt(value),
      }));
    } else {
      setNewCar((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:createCar",
        args: {
          model: newCar.model,
          trim: newCar.trim,
          color: newCar.color,
          maker: newCar.maker,
          lastMaintenanceDate: newCar.lastMaintenanceDate,
          available: newCar.available,
          year: newCar.year,
          registrationNumber: newCar.registrationNumber,
          pictures: newCar.pictures,
          pricePerDay: newCar.pricePerDay,
        },
      });
      const response2 = await axios.post(`${API_BASE_URL}/action`, {
        path: "car:fetchAndStoreCarSpecifications",
        args: {
          maker: newCar.maker,
          model: newCar.model,
          year: newCar.year,
          trim: newCar.trim,
          registrationNumber: newCar.registrationNumber,
        },
      });
      if (response.data) {
        onCarAdded(response.data);
        setNewCar({
          model: "",
          trim: "",
          color: "",
          maker: "",
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
      console.error("Error adding car:", err);
      setError("Failed to add car. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isAddingCar} onOpenChange={setIsAddingCar}>
      <SheetTrigger asChild>
        <Button variant="default" className="text-white">
          Add Car
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Add New Car</SheetTitle>
            <SheetDescription>
              Enter the details of the new car below. Click "Add" to save.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={handleAddCarSubmit}
            className="space-y-4 mt-4 flex-grow overflow-y-auto"
          >
            <div>
              <label htmlFor="year" className="text-sm font-medium">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={newCar.year}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="maker" className="text-sm font-medium">
                Make
              </label>
              <select
                id="maker"
                name="maker"
                value={newCar.maker}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                disabled={!newCar.year || makes.length === 0}
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="model" className="text-sm font-medium">
                Model
              </label>
              <select
                id="model"
                name="model"
                value={newCar.model}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                disabled={!newCar.maker || models.length === 0}
              >
                <option value="">Select Model</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="trim" className="text-sm font-medium">
                Trim
              </label>
              <select
                id="trim"
                name="trim"
                value={newCar.trim}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled={!newCar.model || trims.length === 0}
              >
                <option value="">Select Trim</option>
                {trims.map((trim) => (
                  <option key={trim} value={trim}>
                    {trim}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="color" className="text-sm font-medium">
                Color
              </label>
              <Input
                id="color"
                name="color"
                value={newCar.color}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="lastMaintenanceDate" className="text-sm font-medium">
                Last Maintenance Date
              </label>
              <Input
                id="lastMaintenanceDate"
                name="lastMaintenanceDate"
                type="date"
                value={newCar.lastMaintenanceDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="available" className="text-sm font-medium mr-2">
                Available
              </label>
              <input
                id="available"
                name="available"
                type="checkbox"
                checked={newCar.available}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="registrationNumber" className="text-sm font-medium">
                Registration Number
              </label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={newCar.registrationNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="pictures" className="text-sm font-medium">
                Picture URLs (comma-separated)
              </label>
              <Input
                id="pictures"
                name="pictures"
                value={newCar.pictures.join(", ")}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="pricePerDay" className="text-sm font-medium">
                Price per Day
              </label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                value={newCar.pricePerDay}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="mt-4">
              <Button
                type="submit"
                className="text-white w-full"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Car"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CarAdd;
