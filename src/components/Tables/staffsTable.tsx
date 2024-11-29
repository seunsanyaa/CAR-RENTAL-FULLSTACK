"use client"

import { addStaffMember, deleteStaffMember, fetchAllStaff, updateStaffMember } from '@/endpoints/management';
import { StaffMember } from "@/types/staff";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
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
  const queryClient = useQueryClient();
  
  const { data: staffData, isLoading, error } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchAllStaff
  });

  const addMutation = useMutation({
    mutationFn: addStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsAddingStaff(false);
      setNewStaff({ role: '', email: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role: string; email: string } }) =>
      updateStaffMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setEditingStaff(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaffMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    }
  });

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    role: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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
      updateMutation.mutate({
        id: editingStaff._id,
        data: {
          role: editingStaff.role,
          email: editingStaff.email,
        }
      });
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addMutation.mutate(newStaff);
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
      
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      
      {!isLoading && !error && (
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
              {staffData?.map((staff) => (
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