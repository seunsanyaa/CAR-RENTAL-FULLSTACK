"use client"

import { Customer } from "@/types/customer1";
import { User } from "@/types/staff";
import axios from "axios";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
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

const CustomersTable = () => {
  const [customersData, setCustomersData] = useState<(Customer & { user?: User })[]>([]);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    nationality: "",
    age: 0,
    phoneNumber: "",
    licenseNumber: "",
    address: "",
    dateOfBirth: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : value,
    }));

    if (editingCustomer) {
      setEditingCustomer((prev: Customer | null) =>
        prev
          ? {
              ...prev,
              [name]: name === 'age' ? parseInt(value) : value,
            }
          : null
      );
    }
  };

  const handleDelete = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Delete customer
      const customerResponse = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "customers:deleteCustomer",
        args: { userId }
      });

      // Delete user
      const userResponse = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "users:deleteUser",
        args: { userId }
      });

      if (customerResponse.data && userResponse.data) {
        setCustomersData(customersData.filter((customer) => customer.userId !== userId));
      }
    } catch (err) {
      console.error('Error deleting customer and user:', err);
      setError('Failed to delete customer and user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer({ ...customer });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingCustomer) {
      setLoading(true);
      setError(null);
      try {
        // Update user details (name and email)
        const userResponse = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "users:editUser",
          args: {
            userId: editingCustomer.userId,
            email: editingCustomer.user?.email,
            firstName: editingCustomer.user?.firstName,
            lastName: editingCustomer.user?.lastName,
          }
        });

        // Update customer details
        const customerResponse = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "customers:updateCustomer",
          args: {
            userId: editingCustomer.userId,
            nationality: editingCustomer.nationality,
            age: editingCustomer.age,
            phoneNumber: editingCustomer.phoneNumber,
            licenseNumber: editingCustomer.licenseNumber,
            address: editingCustomer.address,
            dateOfBirth: editingCustomer.dateOfBirth,
          }
        });

        if (userResponse.data && customerResponse.data) {
          setCustomersData(customersData.map((customer) =>
            customer.userId === editingCustomer.userId ? {
              ...editingCustomer,
              user: {
                ...editingCustomer.user,
                email: editingCustomer.user?.email,
                firstName: editingCustomer.user?.firstName,
                lastName: editingCustomer.user?.lastName,
              }
            } : customer
          ));
          setEditingCustomer(null);
        }
      } catch (err) {
        console.error('Error updating customer:', err);
        setError('Failed to update customer. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "customers:getAllCustomers",
        args: {}
      });
      if (response.data) {
        const customers = response.data.value;
        const customersWithUserDetails = await Promise.all(
          customers.map(async (customer: Customer) => {
            const userResponse = await axios.post(`${API_BASE_URL}/query`, {
              path: "users:getFullUser",
              args: { userId: customer.userId }
            });
            return { ...customer, user: userResponse.data.value };
          })
        );

        console.log(customersWithUserDetails);
        setCustomersData(customersWithUserDetails);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to fetch customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create user first
      const userResponse = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "users:createUser",
        args: {
          email: newCustomer.email,
          userId: newCustomer.userId,
          firstName: newCustomer.firstName,
          lastName: newCustomer.lastName,
          staff: false, // Set to false for customers
        }
      });

      if (!userResponse.data) {
        console.error('User creation failed');
        throw new Error('User creation failed');
      }

      // Now create the customer
      const customerResponse = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "customers:createCustomer",
        args: {
          userId: newCustomer.userId,
          nationality: newCustomer.nationality,
          age: newCustomer.age,
          phoneNumber: newCustomer.phoneNumber,
          licenseNumber: newCustomer.licenseNumber,
          address: newCustomer.address,
          dateOfBirth: newCustomer.dateOfBirth,
        }
      });

      if (customerResponse.data) {
        const addedCustomer = {
          ...customerResponse.data,
          user: userResponse.data,
        };
        setCustomersData([...customersData, addedCustomer]);
        setNewCustomer({
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          nationality: "",
          age: 0,
          phoneNumber: "",
          licenseNumber: "",
          address: "",
          dateOfBirth: "",
        });
        setIsAddingCustomer(false);

        // Send welcome email
        try {
          await fetch('/api/sendEmail', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: addedCustomer.email,
              subject: 'Welcome to Our Service!',
              text: `Hello ${addedCustomer.user.firstName},\n\nWelcome to our service! We&apos;re excited to have you as a customer.\n\nBest regards,\nYour Company`,
              html: `<p>Hello ${addedCustomer.user.firstName},</p><p>Welcome to our service! We&apos;re excited to have you as a customer.</p><p>Best regards,<br>Your Company</p>`,
            }),
          });
          console.log('Welcome email sent successfully');
        } catch (emailErr) {
          console.error('Error sending welcome email:', emailErr);
        }
      }
    fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      setError('Failed to add customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCustomer = (customer: Customer & { user?: User }) => {
    setNewCustomer({
      ...customer,
      userId: "", // Keep this empty as it should be a new ID
      firstName: customer.user?.firstName || "",
      lastName: customer.user?.lastName || "",
      email: customer.user?.email || "",
    });
    setIsAddingCustomer(true);
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

  // Add sorting functionality
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customersData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((customer) =>
        Object.values(customer).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [customersData, searchTerm, sortConfig]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsAddingCustomer(true)}
            className="bg-primary text-white hover:bg-opacity-90"
          >
            Add Customer
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('firstName')}>
                  Name
                  {sortConfig?.key === 'firstName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('email')}>
                  Email
                  {sortConfig?.key === 'email' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('nationality')}>
                  Nationality
                  {sortConfig?.key === 'nationality' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('age')}>
                  Age
                  {sortConfig?.key === 'age' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('phoneNumber')}>
                  Phone
                  {sortConfig?.key === 'phoneNumber' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCustomers.map((customer) => (
              <React.Fragment key={customer.userId}>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(customer.userId)}
                    >
                      {expandedRows.has(customer.userId) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                  <td className="py-3 px-4">
                    {customer.user ? `${customer.user.firstName} ${customer.user.lastName}` : 'N/A'}
                  </td>
                  <td className="py-3 px-4">{customer.user ? customer.user.email : 'N/A'}</td>
                  <td className="py-3 px-4">{customer.nationality}</td>
                  <td className="py-3 px-4">{customer.age}</td>
                  <td className="py-3 px-4">{customer.phoneNumber}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(customer)}>Edit</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <div className="h-full flex flex-col">
                          <SheetHeader>
                            <SheetTitle>Edit Customer</SheetTitle>
                            <SheetDescription>
                              Make changes to the customer details here. Click &quot;save&quot; when you&apos;re done.
                            </SheetDescription>
                          </SheetHeader>
                          {editingCustomer && customer.userId === editingCustomer.userId && (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                              <div>
                                <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                <Input
                                  id="firstName"
                                  name="firstName"
                                  value={editingCustomer.user?.firstName || ''}
                                  onChange={(e) => setEditingCustomer({
                                    ...editingCustomer,
                                    user: { ...editingCustomer.user, firstName: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                <Input
                                  id="lastName"
                                  name="lastName"
                                  value={editingCustomer.user?.lastName || ''}
                                  onChange={(e) => setEditingCustomer({
                                    ...editingCustomer,
                                    user: { ...editingCustomer.user, lastName: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input
                                  id="email"
                                  name="email"
                                  type="email"
                                  value={editingCustomer.user?.email || ''}
                                  onChange={(e) => setEditingCustomer({
                                    ...editingCustomer,
                                    user: { ...editingCustomer.user, email: e.target.value }
                                  })}
                                />
                              </div>
                              <div>
                                <label htmlFor="nationality" className="text-sm font-medium">Nationality</label>
                                <Input
                                  id="nationality"
                                  name="nationality"
                                  value={editingCustomer.nationality}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="age" className="text-sm font-medium">Age</label>
                                <Input
                                  id="age"
                                  name="age"
                                  type="number"
                                  value={editingCustomer.age}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
                                <Input
                                  id="phoneNumber"
                                  name="phoneNumber"
                                  value={editingCustomer.phoneNumber}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="licenseNumber" className="text-sm font-medium">License Number</label>
                                <Input
                                  id="licenseNumber"
                                  name="licenseNumber"
                                  value={editingCustomer.licenseNumber}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="address" className="text-sm font-medium">Address</label>
                                <Input
                                  id="address"
                                  name="address"
                                  value={editingCustomer.address}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</label>
                                <Input
                                  id="dateOfBirth"
                                  name="dateOfBirth"
                                  type="date"
                                  value={editingCustomer.dateOfBirth}
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
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(customer.userId)}
                    >
                      Delete
                    </Button>
                    <Link href={`/customers/${customer.userId}`}>
                      <Button variant="link" size="sm">View</Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleCopyCustomer(customer)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Clone
                    </Button>
                  </td>
                </tr>
                {expandedRows.has(customer.userId) && (
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td colSpan={7} className="py-3 px-4">
                      <div className="grid grid-cols-2 gap-4">
                        <p><strong>Name:</strong> {customer.user ? `${customer.user.firstName} ${customer.user.lastName}` : 'N/A'}</p>
                        <p><strong>Email:</strong> {customer.user ? customer.user.email : 'N/A'}</p>
                        <p><strong>Nationality:</strong> {customer.nationality}</p>
                        <p><strong>Age:</strong> {customer.age}</p>
                        <p><strong>Phone Number:</strong> {customer.phoneNumber}</p>
                        <p><strong>License Number:</strong> {customer.licenseNumber}</p>
                        <p><strong>Address:</strong> {customer.address}</p>
                        <p><strong>Date of Birth:</strong> {customer.dateOfBirth}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default CustomersTable;