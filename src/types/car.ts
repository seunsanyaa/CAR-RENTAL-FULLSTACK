export interface Car {
  model: string;
  color: string;
  maker: string;
  trim: string;
  lastMaintenanceDate: string;
  available: boolean;
  year: number;
  disabled: boolean;
  registrationNumber: string;
  categories?: string[];
  pictures: string[];
  pricePerDay: number;
}