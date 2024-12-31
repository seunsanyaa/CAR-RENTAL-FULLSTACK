import { User } from "./staff";

export interface Customer {
  userId: string;
  nationality: string;
  age: number;
  phoneNumber: string;
  licenseNumber: string;
  address: string;
  dateOfBirth: string;
  user?: User;
  goldenMember: boolean;
  id?: string;
  name?: string;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

// You can add additional customer-related interfaces or types here if needed

