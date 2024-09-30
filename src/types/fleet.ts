export type Fleet = {

  name: string; 
  model: string;
  carCount: number; // Number of cars in the fleet
  averageMileage: number; // Average mileage of the cars
  fuelType: 'gasoline' | 'hybrid' | 'electric'; // Type of fuel used (e.g., petrol, diesel, electric)
  photos: string[]; // Array of photo filenames
  specifications: string; // Detailed specifications of the car
  features: string; // Notable features of the car
  pricing: string; // Price range or specific price
};
