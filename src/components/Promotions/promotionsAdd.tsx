import { Car } from "@/types/car";
import { Promotion } from "@/types/Promotion";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
interface PromotionsAddProps {
  onPromotionAdded: (promotion: Promotion) => void;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const PromotionsAdd: React.FC<PromotionsAddProps> = ({ onPromotionAdded }) => {
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    promotionTitle: "",
    promotionDescription: "",
    promotionImage: "" as string | File,
    promotionType: "discount",
    promotionValue: 0,
    promotionStartDate: "",
    promotionEndDate: "",
    status: "scheduled",
    goldenMembersOnly: false,
    target: "all",
    specificTarget: [] as string[],
    minimumRentals: 0,
    minimumMoneySpent: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [selectedCars, setSelectedCars] = useState<Set<string>>(new Set());
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);

  useEffect(() => {
    if (showCarSelector) {
      fetchCars();
    }
  }, [showCarSelector]);

  const fetchCars = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "car:getAllCars",
        args: {}
      });
      if (response.data) {
        setAvailableCars(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const handleCarSelection = (carId: string) => {
    setSelectedCars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(carId)) {
        newSet.delete(carId);
      } else {
        newSet.add(carId);
      }
      return newSet;
    });
  };

  const handleAcceptCarSelection = () => {
    setNewPromotion(prev => ({
      ...prev,
      specificTarget: Array.from(selectedCars)
    }));
    setShowCarSelector(false);
  };

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    
    if (name === "target" && value === "specific") {
      setShowCarSelector(true);
    }
    
    if (name === "promotionImage" && files && files[0]) {
      setNewPromotion((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else if (type === "checkbox") {
      setNewPromotion((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (name === "promotionValue") {
      setNewPromotion((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }));
    } else if (name === "specificTarget") {
      setNewPromotion((prev) => ({
        ...prev,
        [name]: value.split(",").map(item => item.trim()),
      }));
    } else {
      setNewPromotion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate permanent promotion
      if (newPromotion.promotionType === 'permenant' && 
          (newPromotion.promotionStartDate || newPromotion.promotionEndDate)) {
        throw new Error('Permanent promotions cannot have start/end dates');
      }

      // Validate non-permanent promotion
      if (newPromotion.promotionType !== 'permenant' && 
          (!newPromotion.promotionStartDate || !newPromotion.promotionEndDate)) {
        throw new Error('Non-permanent promotions must have start and end dates');
      }

      let imageUrl = newPromotion.promotionImage;
      if (newPromotion.promotionImage instanceof File) {
        const base64 = await fileToBase64(newPromotion.promotionImage);
        const uploadResponse = await axios.post("/api/upload", {
          file: base64,
          filename: newPromotion.promotionImage.name,
        });
        imageUrl = uploadResponse.data.url;
      }

      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "promotions:createPromotion",
        args: {
          ...newPromotion,
          promotionImage: imageUrl,
          minimumRentals: parseInt(newPromotion.minimumRentals.toString()),
          minimumMoneySpent: parseFloat(newPromotion.minimumMoneySpent.toString()),
        }
      });

      if (response.data) {
        onPromotionAdded(response.data);
        setNewPromotion({
          promotionTitle: "",
          promotionDescription: "",
          promotionImage: "" as string | File,
          promotionType: "discount",
          promotionValue: 0,
          promotionStartDate: "",
          promotionEndDate: "",
          status: "scheduled",
          goldenMembersOnly: false,
          target: "all",
          specificTarget: [],
          minimumRentals: 0,
          minimumMoneySpent: 0,
        });
        setIsAddingPromotion(false);
      }
    } catch (err: any) {
      console.error("Error adding promotion:", err);
      setError(err.response?.data?.message || err.message || "Failed to add promotion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopPerforming = async () => {
    setIsLoadingPerformance(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "analytics:getMostRentedCars",
        args: { limit: 8 } // Select top 8 performing cars
      });
      
      if (response.data?.value) {
        const topCarIds = response.data.value
          .filter((item: any) => item.car) // Ensure car exists
          .map((item: any) => item.car._id);
        
        setSelectedCars(new Set(topCarIds));
      }
    } catch (err) {
      console.error('Error fetching top performing cars:', err);
    } finally {
      setIsLoadingPerformance(false);
    }
  };

  const handleSelectLeastPerforming = async () => {
    setIsLoadingPerformance(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "analytics:getLeastRentedCars",
        args: { limit: 8 } // Select 8 least performing cars
      });
      
      if (response.data?.value) {
        const leastCarIds = response.data.value
          .filter((item: any) => item.car) // Ensure car exists
          .map((item: any) => item.car._id);
        
        setSelectedCars(new Set(leastCarIds));
      }
    } catch (err) {
      console.error('Error fetching least performing cars:', err);
    } finally {
      setIsLoadingPerformance(false);
    }
  };

  const isPermanentPromotion = newPromotion.promotionType === 'permenant';

  return (
    <>
      <Sheet open={isAddingPromotion} onOpenChange={setIsAddingPromotion}>
        <SheetTrigger asChild>
          <Button variant="default" className="text-white">
            Add Promotion
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>Add New Promotion</SheetTitle>
              <SheetDescription>
                Enter the details of the new promotion below. Click &quot;Add&quot; to save.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
              <div>
                <label htmlFor="promotionTitle" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="promotionTitle"
                  name="promotionTitle"
                  value={newPromotion.promotionTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="promotionDescription" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="promotionDescription"
                  name="promotionDescription"
                  value={newPromotion.promotionDescription}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label htmlFor="promotionImage" className="text-sm font-medium">
                  Promotion Image
                </label>
                <input
                  id="promotionImage"
                  name="promotionImage"
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
                {newPromotion.promotionImage instanceof File && (
                  <p className="text-sm mt-1">{newPromotion.promotionImage.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="promotionType" className="text-sm font-medium">
                  Type
                </label>
                <select
                  id="promotionType"
                  name="promotionType"
                  value={newPromotion.promotionType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="discount">Discount</option>
                  <option value="offer">Offer</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="permenant">Permanent</option>
                </select>
              </div>

              <div>
                <label htmlFor="promotionValue" className="text-sm font-medium">
                  Promotion Value
                </label>
                <Input
                  id="promotionValue"
                  name="promotionValue"
                  type="number"
                  value={newPromotion.promotionValue}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              {!isPermanentPromotion ? (
                <>
                  <div>
                    <label htmlFor="promotionStartDate" className="text-sm font-medium">
                      Start Date
                    </label>
                    <Input
                      id="promotionStartDate"
                      name="promotionStartDate"
                      type="date"
                      value={newPromotion.promotionStartDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="promotionEndDate" className="text-sm font-medium">
                      End Date
                    </label>
                    <Input
                      id="promotionEndDate"
                      name="promotionEndDate"
                      type="date"
                      value={newPromotion.promotionEndDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="minimumRentals" className="text-sm font-medium">
                      Minimum Rentals Required ({newPromotion.minimumRentals})
                    </label>
                    <input
                      id="minimumRentals"
                      name="minimumRentals"
                      type="range"
                      min="0"
                      max="20"
                      value={newPromotion.minimumRentals}
                      onChange={handleInputChange}
                      className="w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="minimumMoneySpent" className="text-sm font-medium">
                      Minimum Money Spent ($)
                    </label>
                    <Input
                      id="minimumMoneySpent"
                      name="minimumMoneySpent"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newPromotion.minimumMoneySpent}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={newPromotion.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="flex items-center">
                <label htmlFor="goldenMembersOnly" className="text-sm font-medium mr-2">
                  Golden Members Only
                </label>
                <input
                  id="goldenMembersOnly"
                  name="goldenMembersOnly"
                  type="checkbox"
                  checked={newPromotion.goldenMembersOnly}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label htmlFor="target" className="text-sm font-medium">
                  Target
                </label>
                <select
                  id="target"
                  name="target"
                  value={newPromotion.target}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="all">All</option>
                  <option value="specific">Specific</option>
                  <option value="none">None</option>
                </select>
              </div>

              {newPromotion.target === 'specific' && (
                <div>
                  <label htmlFor="specificTarget" className="text-sm font-medium">
                    Specific Targets (comma-separated)
                  </label>
                  <Input
                    id="specificTarget"
                    name="specificTarget"
                    value={newPromotion.specificTarget.join(', ')}
                    onChange={handleInputChange}
                    placeholder="Enter targets separated by commas"
                    required
                  />
                </div>
              )}

              {error && <p className="text-red-500">{error}</p>}
              
              <div className="mt-4">
                <Button
                  type="submit"
                  className="text-white w-full"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Promotion"}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showCarSelector} onOpenChange={setShowCarSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select Cars</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center space-x-4 mb-4">
            <Button 
              variant="outline"
              onClick={handleSelectTopPerforming}
              disabled={isLoadingPerformance}
            >
              {isLoadingPerformance ? "Loading..." : "Select Top Performing"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleSelectLeastPerforming}
              disabled={isLoadingPerformance}
            >
              {isLoadingPerformance ? "Loading..." : "Select Least Performing"}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 max-h-[70vh] overflow-y-auto">
            {availableCars.map((car) => (
              <div
                key={car._id}
                className={`border rounded-lg p-2 cursor-pointer transition-all ${
                  selectedCars.has(car._id) ? 'border-primary bg-primary/10' : 'border-gray-200'
                }`}
                onClick={() => handleCarSelection(car._id)}
              >
                <div className="aspect-square relative mb-2">
                  <img
                    src={car.pictures?.[0] || '/placeholder-car.jpg'}
                    alt={`${car.maker} ${car.model}`}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{car.maker} {car.model}</p>
                  <p className="text-gray-500">{car.year}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 p-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCarSelector(false);
                setSelectedCars(new Set());
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAcceptCarSelection}>
              Accept ({selectedCars.size} selected)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PromotionsAdd;
