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
import { Car } from "@/types/car";
import { fetchMakes, fetchModels, fetchTrims } from "../../api/carQueryApi";  

interface CarAddProps {
  onCarAdded: (car: Car) => void;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

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
    registrationNumber: "",
    pictures: [] as File[],
    pricePerDay: 0,
    categories: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);

  const carCategories = [
    "Sedan",
    "SUV",
    "Luxury",
    "Van",
    "Convertible",
    "Truck"
  ];

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
    setNewCar((prev) => ({ ...prev, maker: "", model: "", trim: "", categories: [] }));
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
    setNewCar((prev) => ({ ...prev, model: "", trim: "", categories: [] }));
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
    const { name, value, files, type, checked } = e.target as HTMLInputElement;

    if (name === "pictures") {
      if (files) {
        const selectedFiles = Array.from(files);
        setNewCar((prev) => ({
          ...prev,
          pictures: selectedFiles,
        }));
      }
    } else if (name === "pricePerDay") {
      setNewCar((prev) => ({
        ...prev,
        pricePerDay: parseFloat(value),
      }));
    } else if (type === "checkbox") {
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

  /**
   * Converts a File object to a Base64 string.
   * @param file The file to convert.
   * @returns A promise that resolves to the Base64 string.
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Failed to convert file to base64.");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Handles the form submission:
   * 1. Uploads images to Cloudinary.
   * 2. Saves the image URLs along with other car data to the database.
   */
  const handleAddCarSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Upload images to Cloudinary
      const uploadedImages: string[] = [];
      for (const file of newCar.pictures) {
        const base64 = await fileToBase64(file);
        const response = await axios.post("/api/upload", {
          file: base64,
          filename: file.name,
        });
        if (response.data && response.data.url) {
          uploadedImages.push(response.data.url);
        }
      }

      // Filter out empty strings, null, and undefined from categories array
      const filteredCategories = newCar.categories.filter((category): category is string => 
        typeof category === 'string' && category !== ""
      );

      // Prepare car data with image URLs and categories
      const carData = {
        ...newCar,
        pictures: uploadedImages,
        categories: filteredCategories,
      };

      // Make API call using the same pattern as staffTable
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "car:createCar",
        args: carData
      });
      const response2 = await axios.post(`${API_BASE_URL}/action`, {
        path: "car:fetchAndStoreCarSpecifications",
        args: {
            maker: carData.maker,
            model: carData.model,
            year: carData.year,
            trim: carData.trim,
            registrationNumber: carData.registrationNumber
        }
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
          registrationNumber: "",
          pictures: [],
          pricePerDay: 0,
          categories: [],
        });
        setIsAddingCar(false);
      }
    } catch (err: any) {
      console.error("Error adding car:", err);
      setError(err.response?.data?.message || "Failed to add car. Please try again.");
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
              Enter the details of the new car below. Click &quot;Add&quot; to save.
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
              <label htmlFor="category1" className="text-sm font-medium">
                Primary Category *
              </label>
              <select
                id="category1"
                name="category1"
                value={newCar.categories[0] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewCar(prev => ({
                    ...prev,
                    categories: [value, ...prev.categories.slice(1)]
                  }));
                }}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                {carCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {newCar.categories[0] && (
              <div>
                <label htmlFor="category2" className="text-sm font-medium">
                  Secondary Category (Optional)
                </label>
                <select
                  id="category2"
                  name="category2"
                  value={newCar.categories[1] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCar(prev => ({
                      ...prev,
                      categories: [prev.categories[0], value, prev.categories[2]]
                    }));
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {carCategories
                    .filter(cat => cat !== newCar.categories[0])
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                  ))}
                </select>
              </div>
            )}
            {newCar.categories[1] && (
              <div>
                <label htmlFor="category3" className="text-sm font-medium">
                  Third Category (Optional)
                </label>
                <select
                  id="category3"
                  name="category3"
                  value={newCar.categories[2] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCar(prev => ({
                      ...prev,
                      categories: [prev.categories[0], prev.categories[1], value]
                    }));
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  {carCategories
                    .filter(cat => !newCar.categories.slice(0, 2).includes(cat))
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                  ))}
                </select>
              </div>
            )}
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
                Upload Pictures
              </label>
              <input
                id="pictures"
                name="pictures"
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              {newCar.pictures.length > 0 && (
                <ul className="mt-2">
                  {newCar.pictures.map((file, index) => (
                    <li key={index} className="text-sm">
                      {file.name}
                    </li>
                  ))}
                </ul>
              )}
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
