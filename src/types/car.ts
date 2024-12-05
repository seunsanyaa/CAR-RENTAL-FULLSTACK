export interface Car {
  _id: string;
  model: string;
  color: string;
  maker: string;
  trim: string;
  lastMaintenanceDate: string;
  available: boolean;
  year: number;
  disabled: boolean;
  registrationNumber: string;
  pictures: string[];
  pricePerDay: number;
}
