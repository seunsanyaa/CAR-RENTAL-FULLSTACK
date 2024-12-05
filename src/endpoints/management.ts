import { StaffMember } from "@/types/staff";
import axios from "axios";
import { Resend } from "resend";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;
const resend = new Resend("re_91CLGg11_KRC7mhDZdo5jPotZVydyRDdL");

export const fetchAllStaff = async () => {
  const response = await axios.post(`${API_BASE_URL}/query`, {
    path: "staff:getAllStaff",
    args: {},
  });

  if (!response.data) throw new Error("Failed to fetch staff");

  // Fetch user details for each staff member
  const staffWithUserDetails = await Promise.all(
    response.data.value.map(async (staff: StaffMember) => {
      const userResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "users:getUserByEmail",
        args: { email: staff.email },
      });
      return { ...staff, user: userResponse.data.value };
    }),
  );

  return staffWithUserDetails;
};

export const addStaffMember = async (staffData: {
  role: string;
  email: string;
}) => {
  const response = await axios.post(`${API_BASE_URL}/mutation`, {
    path: "staff:addStaffMember",
    args: staffData,
  });

  if (!response.data) throw new Error("Failed to add staff member");

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: staffData.email,
      subject: "Welcome to the team!",
      html: `
        <h1>Welcome to Our Team!</h1>
        <p>You've been invited to join our platform as a ${staffData.role}.</p>
        <p>Click the link below to set up your account:</p>
        <a href="https://website.com/auth/signup?email=${staffData.email}">
          Set up your account
        </a>
      `,
    });
  } catch (error) {
    console.error("Failed to send invite email:", error);
    // Optionally handle the error differently
  }

  return response.data;
};

export const updateStaffMember = async (
  id: string,
  staffData: { role: string; email: string },
) => {
  const response = await axios.post(`${API_BASE_URL}/mutation`, {
    path: "staff:updateStaffMember",
    args: { id, ...staffData },
  });

  if (!response.data) throw new Error("Failed to update staff member");
  return response.data;
};

export const deleteStaffMember = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/mutation`, {
    path: "staff:deleteStaffMember",
    args: { id },
  });

  if (!response.data) throw new Error("Failed to delete staff member");
  return response.data;
};
