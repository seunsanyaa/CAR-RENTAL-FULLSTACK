export interface StaffMember {
  _id: string;
  role: string;
  email: string;
  // Add other fields as necessary
}

// ... existing code ...

export interface User {
  firstName: string;
  lastName?: string;
  email?: string;
  staff: boolean;
}

// ... existing code ...
