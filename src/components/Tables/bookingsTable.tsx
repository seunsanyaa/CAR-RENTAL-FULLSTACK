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

const API_BASE_URL = 'https://third-elk-244.convex.cloud/api';

// Add this type definition at the top of the file
type Booking = {
  _id: string; // Assuming each booking has a unique ID
  customerId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  paidAmount: number;
  status: string;
  pickupLocation: string;
  dropoffLocation: string;
  customerInsurancetype: string;
  customerInsuranceNumber: string;
};

const BookingsTable = () => {
  const [bookingsData, setBookingsData] = useState<(Booking & { user?: User })[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerId: '',
    carId: '',
    startDate: '',
    endDate: '',
    totalCost: 0,
    paidAmount: 0,
    status: '',
    pickupLocation: '',
    dropoffLocation: '',
    customerInsurancetype: '',
    customerInsuranceNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "bookings:deleteBooking",
        args: { id }
      });
      if (response.data) {
        setBookingsData(bookingsData.filter((booking) => booking._id !== id));
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Failed to delete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking({ ...booking });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === 'totalCost' || name === 'paidAmount' ? parseFloat(value) : value;

    setNewBooking((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (editingBooking) {
      setEditingBooking((prev) =>
        prev ? { ...prev, [name]: newValue } : null
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingBooking) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:updateBooking",
          args: editingBooking
        });
        if (response.data) {
          setBookingsData(bookingsData.map((booking) =>
            booking._id === editingBooking._id ? editingBooking : booking
          ));
          setEditingBooking(null);
        }
      } catch (err) {
        console.error('Error updating booking:', err);
        setError('Failed to update booking. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getAllBookings",
        args: {}
      });
      if (response.data) {
        const bookings = response.data.value;
        setBookingsData(bookings);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAddBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "bookings:createBooking",
        args: newBooking
      });

      if (response.data) {
        const addedBooking = response.data;
        setBookingsData([...bookingsData, addedBooking]);
        setNewBooking({
          customerId: '',
          carId: '',
          startDate: '',
          endDate: '',
          totalCost: 0,
          paidAmount: 0,
          status: '',
          pickupLocation: '',
          dropoffLocation: '',
          customerInsurancetype: '',
          customerInsuranceNumber: '',
        });
        setIsAddingBooking(false);
      }
    } catch (err) {
      console.error('Error adding booking:', err);
      setError('Failed to add booking. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <h4 className="text-xl font-semibold text-black dark:text-white">Bookings Overview</h4>
        <Sheet open={isAddingBooking} onOpenChange={setIsAddingBooking}>
          <SheetTrigger asChild>
            <Button variant="default" className="text-white">Add Booking</Button>
          </SheetTrigger>
          <SheetContent>
            <div className="h-full flex flex-col">
              <SheetHeader>
                <SheetTitle>Add New Booking</SheetTitle>
                <SheetDescription>
                  Enter the details of the new booking below. Click &quot;Add&quot; to save.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleAddBookingSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                <div>
                  <label htmlFor="customerId" className="text-sm font-medium">Customer ID</label>
                  <Input
                    id="customerId"
                    name="customerId"
                    value={newBooking.customerId}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="carId" className="text-sm font-medium">Car ID</label>
                  <Input
                    id="carId"
                    name="carId"
                    value={newBooking.carId}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newBooking.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newBooking.endDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="totalCost" className="text-sm font-medium">Total Cost</label>
                  <Input
                    id="totalCost"
                    name="totalCost"
                    type="number"
                    value={newBooking.totalCost}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="paidAmount" className="text-sm font-medium">Paid Amount</label>
                  <Input
                    id="paidAmount"
                    name="paidAmount"
                    type="number"
                    value={newBooking.paidAmount}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Input
                    id="status"
                    name="status"
                    value={newBooking.status}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="pickupLocation" className="text-sm font-medium">Pickup Location</label>
                  <Input
                    id="pickupLocation"
                    name="pickupLocation"
                    value={newBooking.pickupLocation}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="dropoffLocation" className="text-sm font-medium">Dropoff Location</label>
                  <Input
                    id="dropoffLocation"
                    name="dropoffLocation"
                    value={newBooking.dropoffLocation}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="customerInsurancetype" className="text-sm font-medium">Insurance Type</label>
                  <Input
                    id="customerInsurancetype"
                    name="customerInsurancetype"
                    value={newBooking.customerInsurancetype}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="customerInsuranceNumber" className="text-sm font-medium">Insurance Number</label>
                  <Input
                    id="customerInsuranceNumber"
                    name="customerInsuranceNumber"
                    value={newBooking.customerInsuranceNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mt-4">
                  <Button type="submit" className="text-white w-full">
                    Add Booking
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
                <th className="py-4 px-4 font-medium text-black dark:text-white">Customer ID</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Car ID</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Start Date</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">End Date</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking) => (
                <React.Fragment key={booking._id}>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(booking._id)}
                      >
                        {expandedRows.has(booking._id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="py-3 px-4">{booking.customerId}</td>
                    <td className="py-3 px-4">{booking.carId}</td>
                    <td className="py-3 px-4">{booking.startDate}</td>
                    <td className="py-3 px-4">{booking.endDate}</td>
                    <td className="py-3 px-4">{booking.status}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>Edit</Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Edit Booking</SheetTitle>
                            <SheetDescription>
                              Make changes to the booking details here. Click save when you&apos;re done.
                            </SheetDescription>
                          </SheetHeader>
                          {editingBooking && booking._id === editingBooking._id && (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                              {/* Add input fields for all booking properties */}
                              <div>
                                <label htmlFor="customerId" className="text-sm font-medium">
                                  Customer ID
                                </label>
                                <Input
                                  id="customerId"
                                  name="customerId"
                                  value={editingBooking.customerId}
                                  onChange={handleInputChange}
                                />
                              </div>
                              {/* Add more input fields for other booking properties */}
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
                        onClick={() => handleDelete(booking._id)}
                      >
                        Delete
                      </Button>
                      <Link href={`/bookings/${booking._id}`}>
                        <Button variant="link" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                  {expandedRows.has(booking._id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={7} className="py-3 px-4">
                        <div className="grid grid-cols-2 gap-4">
                          <p><strong>Total Cost:</strong> ${booking.totalCost}</p>
                          <p><strong>Paid Amount:</strong> ${booking.paidAmount}</p>
                          <p><strong>Pickup Location:</strong> {booking.pickupLocation}</p>
                          <p><strong>Dropoff Location:</strong> {booking.dropoffLocation}</p>
                          <p><strong>Insurance Type:</strong> {booking.customerInsurancetype}</p>
                          <p><strong>Insurance Number:</strong> {booking.customerInsuranceNumber}</p>
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

export default BookingsTable;