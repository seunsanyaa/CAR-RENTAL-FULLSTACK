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
import { MultiSelect } from "../FormElements/MultiSelect";

interface CarAddProps {
  onCarAdded: (car: Car) => void;
  initialData?: Omit<Car, 'disabled'> & { disabled?: boolean; golden?: boolean };
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const CarAdd: React.FC<CarAddProps> = ({ onCarAdded, initialData }) => {
  const [isAddingCar, setIsAddingCar] = useState(initialData ? true : false);
  const [newCar, setNewCar] = useState({
    model: initialData?.model || "",
    trim: initialData?.trim || "",
    color: initialData?.color || "",
    maker: initialData?.maker || "",
    lastMaintenanceDate: initialData?.lastMaintenanceDate || "",
    available: initialData?.available || false,
    disabled: initialData?.disabled || false,
    golden: initialData?.golden || false,
    year: initialData?.year || 0,
    registrationNumber: "",
    pictures: [] as File[],
    pricePerDay: initialData?.pricePerDay || 0,
    categories: initialData?.categories || [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [years] = useState<number[]>(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
  });
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [trims, setTrims] = useState<string[]>([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingTrims, setLoadingTrims] = useState(false);

  const carCategories = [
    "Sedan",
    "SUV",
    "Luxury",
    "Van",
    "Convertible",
    "Truck"
  ];

  // Fetch makes when year changes
  useEffect(() => {
    const getMakes = async () => {
      if (newCar.year) {
        setLoadingMakes(true);
        try {
          const response = await fetchMakes(newCar.year);
          if (response && response.Makes) {
            const makesList = response.Makes.map((make: any) => make.make_display);
            setMakes(makesList);
          }
        } catch (err) {
          console.error('Error fetching makes:', err);
          setError('Failed to fetch car makes');
        } finally {
          setLoadingMakes(false);
        }
      } else {
        setMakes([]);
      }
      // Reset dependent fields
      setNewCar(prev => ({ ...prev, maker: '', model: '', trim: '' }));
      setModels([]);
      setTrims([]);
    };

    getMakes();
  }, [newCar.year]);

  // Fetch models when make changes
  useEffect(() => {
    const getModels = async () => {
      if (newCar.year && newCar.maker) {
        setLoadingModels(true);
        try {
          const response = await fetchModels(newCar.year, newCar.maker);
          if (response && response.Models) {
            const modelsList = response.Models.map((model: any) => model.model_name);
            setModels(modelsList);
          }
        } catch (err) {
          console.error('Error fetching models:', err);
          setError('Failed to fetch car models');
        } finally {
          setLoadingModels(false);
        }
      } else {
        setModels([]);
      }
      // Reset dependent fields
      setNewCar(prev => ({ ...prev, model: '', trim: '' }));
      setTrims([]);
    };

    getModels();
  }, [newCar.year, newCar.maker]);

  // Fetch trims when model changes
  useEffect(() => {
    const getTrims = async () => {
      if (newCar.year && newCar.maker && newCar.model) {
        setLoadingTrims(true);
        try {
          const response = await fetchTrims(newCar.year, newCar.maker, newCar.model);
          if (response && response.Trims) {
            const trimsList = response.Trims.map((trim: any) => trim.model_trim);
            setTrims(trimsList);
          }
        } catch (err) {
          console.error('Error fetching trims:', err);
          setError('Failed to fetch car trims');
        } finally {
          setLoadingTrims(false);
        }
      } else {
        setTrims([]);
      }
      // Reset dependent field
      setNewCar(prev => ({ ...prev, trim: '' }));
    };

    getTrims();
  }, [newCar.year, newCar.maker, newCar.model]);

  // Handle initial data loading for cloning
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialData) {
        setNewCar({
          model: initialData.model,
          trim: initialData.trim,
          color: initialData.color,
          maker: initialData.maker,
          lastMaintenanceDate: initialData.lastMaintenanceDate,
          available: initialData.available,
          disabled: initialData.disabled || false,
          golden: initialData.golden || false,
          year: initialData.year,
          registrationNumber: "",
          pictures: [],
          pricePerDay: initialData.pricePerDay,
          categories: initialData.categories || [],
        });

        // Load makes for the initial year
        if (initialData.year) {
          setLoadingMakes(true);
          try {
            const makesResponse = await fetchMakes(initialData.year);
            if (makesResponse && makesResponse.Makes) {
              const makesList = makesResponse.Makes.map((make: any) => make.make_display);
              setMakes(makesList);
            }
          } catch (err) {
            console.error('Error fetching makes:', err);
          } finally {
            setLoadingMakes(false);
          }
        }

        // Load models for the initial make
        if (initialData.year && initialData.maker) {
          setLoadingModels(true);
          try {
            const modelsResponse = await fetchModels(initialData.year, initialData.maker);
            if (modelsResponse && modelsResponse.Models) {
              const modelsList = modelsResponse.Models.map((model: any) => model.model_name);
              setModels(modelsList);
            }
          } catch (err) {
            console.error('Error fetching models:', err);
          } finally {
            setLoadingModels(false);
          }
        }

        // Load trims for the initial model
        if (initialData.year && initialData.maker && initialData.model) {
          setLoadingTrims(true);
          try {
            const trimsResponse = await fetchTrims(initialData.year, initialData.maker, initialData.model);
            if (trimsResponse && trimsResponse.Trims) {
              const trimsList = trimsResponse.Trims.map((trim: any) => trim.model_trim);
              setTrims(trimsList);
            }
          } catch (err) {
            console.error('Error fetching trims:', err);
          } finally {
            setLoadingTrims(false);
          }
        }
      }
    };

    loadInitialData();
  }, [initialData]);

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
        disabled: newCar.disabled,
        golden: newCar.golden,
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
          disabled: false,
          golden: false,
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

  const handleYearSelect = (value: string) => {
    const yearValue = parseInt(value);
    setNewCar(prev => ({ ...prev, year: yearValue }));
  };

  const handleMakeSelect = (value: string) => {
    setNewCar(prev => ({ ...prev, maker: value }));
  };

  const handleModelSelect = (value: string) => {
    setNewCar(prev => ({ ...prev, model: value }));
  };

  const handleTrimSelect = (value: string) => {
    setNewCar(prev => ({ ...prev, trim: value }));
  };

  return (
    <Sheet 
      open={isAddingCar} 
      onOpenChange={(open) => {
        setIsAddingCar(open);
        if (!open) {
          onCarAdded({} as Car); // This will trigger the parent to reset cloningCar
        }
      }}
    >
      <SheetTrigger asChild>
        {!initialData && (
          <Button variant="default" className="text-white">
            Add Car
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <div className="h-full flex flex-col">
          <SheetHeader>
            <SheetTitle>{initialData ? "Clone Car" : "Add New Car"}</SheetTitle>
            <SheetDescription>
              Enter the details of the {initialData ? "cloned" : "new"} car below. Click &quot;{initialData ? "Clone" : "Add"}&quot; to save.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={handleAddCarSubmit}
            className="space-y-4 mt-4 flex-grow overflow-y-auto"
          >
            <div>
              <label htmlFor="year" className="text-sm font-medium">
                Year *
              </label>
              <MultiSelect
                id="year"
                options={years.map(year => ({ value: year.toString(), text: year.toString() }))}
                onSelect={handleYearSelect}
                placeholder="Select year"
                allowCustomInput={false}
                initialValue={initialData?.year ? initialData.year.toString() : undefined}
              />
            </div>
            
            <div>
              <label htmlFor="maker" className="text-sm font-medium">
                Make *
              </label>
              <div className="relative">
                <MultiSelect
                  id="maker"
                  options={makes.map(make => ({ value: make, text: make }))}
                  onSelect={handleMakeSelect}
                  placeholder={loadingMakes ? "Loading makes..." : "Select make"}
                  allowCustomInput={false}
                  initialValue={initialData?.maker}
                />
                {loadingMakes && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="model" className="text-sm font-medium">
                Model *
              </label>
              <div className="relative">
                <MultiSelect
                  id="model"
                  options={models.map(model => ({ value: model, text: model }))}
                  onSelect={handleModelSelect}
                  placeholder={loadingModels ? "Loading models..." : "Select model"}
                  allowCustomInput={false}
                  initialValue={initialData?.model}
                />
                {loadingModels && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="trim" className="text-sm font-medium">
                Trim
              </label>
              <div className="relative">
                <MultiSelect
                  id="trim"
                  options={trims.map(trim => ({ value: trim, text: trim }))}
                  onSelect={handleTrimSelect}
                  placeholder={loadingTrims ? "Loading trims..." : "Select trim"}
                  allowCustomInput={false}
                  initialValue={initialData?.trim}
                />
                {loadingTrims && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
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
            <div className="flex items-center space-x-4">
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
              <div className="flex items-center">
                <label htmlFor="disabled" className="text-sm font-medium mr-2">Disabled</label>
                <input
                  id="disabled"
                  name="disabled"
                  type="checkbox"
                  checked={newCar.disabled}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="golden" className="text-sm font-medium mr-2">Golden Member</label>
                <input
                  id="golden"
                  name="golden"
                  type="checkbox"
                  checked={newCar.golden}
                  onChange={handleInputChange}
                />
              </div>
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
