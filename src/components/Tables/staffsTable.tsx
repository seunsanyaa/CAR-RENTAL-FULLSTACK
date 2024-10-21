"use client"

import { StaffMember, User } from "@/types/staff";
import axios from "axios";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const StaffTable = () => {
  const [staffData, setStaffData] = useState<(StaffMember & { user?: User })[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    role: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "staff:deleteStaffMember",
        args: { id }
      });
      if (response.data) {
        setStaffData(staffData.filter((staff) => staff._id !== id));
      }
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('Failed to delete staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaff({ ...staff });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;

    setNewStaff((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    if (editingStaff) {
      setEditingStaff((prev: StaffMember | null) =>
        prev
          ? {
              ...prev,
              [name]:
                type === "checkbox"
                  ? checked
                  : value,
            }
          : null
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingStaff) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "staff:updateStaffMember",
          args: {
            id: editingStaff._id,
            role: editingStaff.role,
            email: editingStaff.email,
          }
        });
        if (response.data) {
          setStaffData(staffData.map((staff) =>
            staff._id === editingStaff._id ? editingStaff : staff
          ));
          setEditingStaff(null);
        }
      } catch (err) {
        console.error('Error updating staff member:', err);
        setError('Failed to update staff member. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "staff:getAllStaff",
        args: {}
      });
      if (response.data) {
        const staffMembers = response.data.value;
        const staffWithUserDetails = await Promise.all(
          staffMembers.map(async (staff: StaffMember) => {
            const userResponse = await axios.post(`${API_BASE_URL}/query`, {
              path: "users:getUserByEmail",
              args: { email: staff.email }
            });
            return { ...staff, user: userResponse.data.value };
          })
        );

        console.log(staffWithUserDetails)
        setStaffData(staffWithUserDetails);
      }
    } catch (err) {
      console.error('Error fetching staff members:', err);
      setError('Failed to fetch staff members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [newStaff]);

  const handleAddStaffSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Add the new staff member
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "staff:addStaffMember",
        args: {
          role: newStaff.role,
          email: newStaff.email,
        }
      });

      if (response.data) {
        const addedStaff = response.data;
        setStaffData([...staffData, addedStaff]);
        setNewStaff({
          role: "",
          email: "",
        });
        setIsAddingStaff(false);

        // Send a welcome email using the API route
        try {
          await fetch('/api/sendEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: addedStaff.email,
              subject: 'Welcome to the Team!',
              text: `Hello ${addedStaff.role},\n\nWelcome to the team! We're excited to have you on board.\n\nBest regards,\nYour Company`,
              html: `<p>Hello <strong>${addedStaff.role}</strong>,</p><p>Welcome to the team! We're excited to have you on board.</p><p>Best regards,<br>Your Company</p>`,
            }),
          });
          console.log('Welcome email sent successfully');
        } catch (emailErr) {
          console.error('Error sending welcome email:', emailErr);
        }
      }
    } catch (err) {
      console.error('Error adding staff member:', err);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStaff = (staff: StaffMember) => {
    setNewStaff({
      role: staff.role,
      email: staff.email,
    });
    setIsAddingStaff(true);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Staff Overview</h4>
        <Sheet open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <SheetTrigger asChild>
            <Button variant="default" className="text-white">Add Staff</Button>
          </SheetTrigger>
          <SheetContent>
            <div className="h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>Add New Staff Member</SheetTitle>
                <SheetDescription>
                  Enter the details of the new staff member below. Click &quot;Add&quot; to save.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleAddStaffSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                <div>
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <Input
                    id="role"
                    name="role"
                    value={newStaff.role}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newStaff.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mt-4">
                  <Button type="submit" className="text-white w-full">
                    Add Staff Member
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Name</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Role</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Email</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff) => (
                <React.Fragment key={staff._id}>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(staff._id)}
                      >
                        {expandedRows.has(staff._id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      {staff.user ? `${staff.user.firstName} ${staff.user.lastName}` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">{staff.role}</td>
                    <td className="py-3 px-4">{staff.email}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(staff)}>Edit</Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Edit Staff Member</SheetTitle>
                            <SheetDescription>
                              Make changes to the staff member details here. Click save when you&apos;re done.
                            </SheetDescription>
                          </SheetHeader>
                          {editingStaff && staff._id === editingStaff._id && (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                              <div>
                                <label htmlFor="role" className="text-sm font-medium">
                                  Role
                                </label>
                                <Input
                                  id="role"
                                  name="role"
                                  value={editingStaff.role}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="email" className="text-sm font-medium">
                                  Email
                                </label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={editingStaff.email}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div className="mt-4">
                                <Button type="submit" className="text-white w-full">
                                  Save Changes
                                </Button>
                              </div>
                            </form>
                          )}
                        </SheetContent>
                      </Sheet>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(staff._id)}
                      >
                        Delete
                      </Button>
                      <Link href={`/staff/${staff._id}`}>
                        <Button variant="link" size="sm">View</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => handleCopyStaff(staff)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Clone
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(staff._id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={5} className="py-3 px-4">
                        <div className="grid grid-cols-1 gap-4">
                          <p><strong>Name:</strong> {staff.user ? `${staff.user.firstName} ${staff.user.lastName}` : 'N/A'}</p>
                          <p><strong>Role:</strong> {staff.role}</p>
                          <p><strong>Email:</strong> {staff.email}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffTable;