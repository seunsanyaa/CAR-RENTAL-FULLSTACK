"use client"

import { StaffMember, User } from "@/types/staff";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Image from "next/image";

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface BookingExtras {
  insurance: boolean;
  insuranceCost: number;
  gps: boolean;
  childSeat: boolean;
  chauffer: boolean;
  travelKit: boolean;
}

interface NewBooking {
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
  paymentType: string;
  extras: BookingExtras;
}

interface Booking extends NewBooking {
  _id: string;
  customerEmail?: string;
  carDetails?: {
    maker: string;
    model: string;
    year: number;
    registrationNumber: string;
  };
}

interface Car {
  _id: string;
  maker: string;
  model: string;
  year: number;
  pictures?: string[];
  registrationNumber: string;
  pricePerDay: number;
}

const BookingsTable = () => {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newBooking, setNewBooking] = useState<NewBooking>({
    customerId: '',
    carId: '',
    startDate: '',
    endDate: '',
    totalCost: 0,
    paidAmount: 0,
    status: 'pending',
    pickupLocation: '',
    dropoffLocation: '',
    customerInsurancetype: '',
    customerInsuranceNumber: '',
    paymentType: 'full',
    extras: {
      insurance: false,
      insuranceCost: 0,
      gps: false,
      childSeat: false,
      chauffer: false,
      travelKit: false
    }
  });
  const [addBookingStep, setAddBookingStep] = useState<'email' | 'car' | 'details'>('email');
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [totalDays, setTotalDays] = useState(1);
  const [insuranceType, setInsuranceType] = useState<string>('basic');
  const [dateError, setDateError] = useState<string>('');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const insuranceOptions = {
    basic: { price: 10, coverage: 'Basic coverage for accidents and theft' },
    premium: { price: 20, coverage: 'Premium coverage including natural disasters and third-party damage' },
    comprehensive: { price: 30, coverage: 'Full coverage with zero deductible and roadside assistance' }
  };

  const handleInsuranceTypeChange = (value: string) => {
    setInsuranceType(value);
    if (newBooking.extras.insurance) {
      setNewBooking(prev => ({
        ...prev,
        extras: {
          ...prev.extras,
          insuranceCost: insuranceOptions[value as keyof typeof insuranceOptions].price
        }
      }));
    }
  };

  const handleExtraChange = (extra: keyof typeof newBooking.extras) => {
    if (extra === 'insurance') {
      setNewBooking(prev => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extra]: !prev.extras[extra],
          insuranceCost: !prev.extras[extra] ? insuranceOptions[insuranceType as keyof typeof insuranceOptions].price : 0
        }
      }));
    } else {
      setNewBooking(prev => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extra]: !prev.extras[extra]
        }
      }));
    }
  };

  const calculateTotal = () => {
    if (!selectedCar) return { display: '0.00', amount: 0 };

    // Base price calculation
    let basePrice = selectedCar.pricePerDay * totalDays;

    // Add extras
    const extrasCost = (
      (newBooking.extras.insurance ? newBooking.extras.insuranceCost : 0) +
      (newBooking.extras.gps ? 5 : 0) +
      (newBooking.extras.childSeat ? 8 : 0) +
      (newBooking.extras.chauffer ? 100 : 0)
    ) * totalDays;

    let totalPrice = basePrice + extrasCost;

    return {
      display: totalPrice.toFixed(2),
      amount: totalPrice
    };
  };

  const handleStartDateChange = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    if (selectedDate < today) {
      setDateError("Pickup date must be today or later");
      setNewBooking(prev => ({ ...prev, startDate: '' }));
      return;
    }

    if (currentBooking) {
      const bookingStart = new Date(currentBooking.startDate);
      const bookingEnd = new Date(currentBooking.endDate);
      
      if (selectedDate >= bookingStart && selectedDate <= bookingEnd) {
        setDateError("You have an existing booking during this period");
        setNewBooking(prev => ({ ...prev, startDate: '' }));
        return;
      }
    }

    setDateError('');
    setNewBooking(prev => ({ ...prev, startDate: date }));
    updateTotalDays(date, newBooking.endDate);
  };

  const handleEndDateChange = (date: string) => {
    const endDate = new Date(date);
    const startDate = new Date(newBooking.startDate);

    if (endDate <= startDate) {
      setDateError('Drop-off date must be after pickup date');
      setNewBooking(prev => ({ ...prev, endDate: '' }));
      return;
    }

    if (currentBooking) {
      const bookingStart = new Date(currentBooking.startDate);
      const bookingEnd = new Date(currentBooking.endDate);
      
      if (endDate >= bookingStart && endDate <= bookingEnd) {
        setDateError('You have an existing booking during this period');
        setNewBooking(prev => ({ ...prev, endDate: '' }));
        return;
      }
    }

    setDateError('');
    setNewBooking(prev => ({ ...prev, endDate: date }));
    updateTotalDays(newBooking.startDate, date);
  };

  const updateTotalDays = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const differenceInTime = endDate.getTime() - startDate.getTime();
      const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
      setTotalDays(differenceInDays > 0 ? differenceInDays : 1);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEdit = (booking: Booking) => {
    setEditingBooking({ ...booking });
  };

  const handleCopyBooking = (booking: Booking) => {
    setNewBooking({
      customerId: '',
      carId: '',
      startDate: '',
      endDate: '',
      totalCost: 0,
      paidAmount: 0,
      status: 'pending',
      pickupLocation: '',
      dropoffLocation: '',
      customerInsurancetype: '',
      customerInsuranceNumber: '',
      paymentType: 'full',
      extras: {
        insurance: false,
        insuranceCost: 0,
        gps: false,
        childSeat: false,
        chauffer: false,
        travelKit: false
      }
    });
    setIsAddingBooking(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingBooking) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:updateBooking",
          args: { ...editingBooking }
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

      if (response.data?.value) {
        // Fetch customer and car details for each booking
        const bookingsWithDetails = await Promise.all(
          response.data.value.map(async (booking: Booking) => {
            try {
              // Fetch user details
              const userResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "users:getFullUser",
                args: { userId: booking.customerId }
              });

              // Fetch car details
              const carResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "car:getCar",
                args: { registrationNumber: booking.carId }
              });
              
              return {
                ...booking,
                customerEmail: userResponse.data?.value?.email || 'N/A',
                carDetails: carResponse.data?.value || null
              };
            } catch (err) {
              console.error(`Error fetching details for booking ${booking._id}:`, err);
              return {
                ...booking,
                customerEmail: 'N/A',
                carDetails: null
              };
            }
          })
        );
        setBookingsData(bookingsWithDetails);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to fetch user email when selecting a customer
  const handleCustomerIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    try {
      const userResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "users:getFullUser",
        args: { userId: value }
      });
      
      if (userResponse.data?.value) {
        setNewBooking(prev => ({
          ...prev,
          customerId: value,
          customerEmail: userResponse.data.value.email
        }));
      } else {
        setError('Customer not found');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch customer details');
    }
  };

  const handleDelete = async (booking: Booking) => {
    setLoading(true);
    setError(null);
    try {
      if (booking.status === 'cancelled') {
        // If booking is already cancelled, delete it completely
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "analytics:deleteBooking",
          args: { bookingId: booking._id }
        });
        if (response.data) {
          setBookingsData(bookingsData.filter(b => b._id !== booking._id));
        }
      } else {
        // Otherwise, cancel the booking
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:cancelBooking",
          args: { bookingId: booking._id }
        });
        if (response.data) {
          // Update the booking status in the local state
          setBookingsData(bookingsData.map(b => 
            b._id === booking._id 
              ? { ...b, status: 'cancelled' }
              : b
          ));
        }
      }
    } catch (err) {
      console.error('Error handling booking:', err);
      setError(booking.status === 'cancelled' 
        ? 'Failed to delete booking. Please try again.' 
        : 'Failed to cancel booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserByEmail = async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "users:getUserByEmail",
        args: { email }
      });
      
      if (response.data?.value) {
        setNewBooking(prev => ({
          ...prev,
          customerId: response.data.value.userId,
        }));
        setAddBookingStep('car');
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user details');
    }
  };

  const fetchCars = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "car:getAllCars",
        args: {}
      });
      if (response.data) {
        setAvailableCars(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  const handleCarSelection = (car: Car) => {
    setSelectedCar(car);
    setNewBooking(prev => ({
      ...prev,
      carId: car.registrationNumber
    }));
    setShowCarSelector(false);
    setAddBookingStep('details');
  };

  const handleAddBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const totalAmount = calculateTotal().amount;
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "bookings:createBooking",
        args: {
          customerId: newBooking.customerId,
          carId: newBooking.carId,
          startDate: newBooking.startDate,
          endDate: newBooking.endDate,
          totalCost: totalAmount,
          paidAmount: 0, // Start with 0 paid amount
          status: newBooking.status,
          pickupLocation: newBooking.pickupLocation,
          dropoffLocation: newBooking.dropoffLocation,
          paymentType: newBooking.paymentType,
          extras: newBooking.extras
        }
      });
      if (response.data) {
        await fetchBookings();
        setIsAddingBooking(false);
        setAddBookingStep('email');
        setSelectedCar(null);
        setUserEmail('');
        setNewBooking({
          customerId: '',
          carId: '',
          startDate: '',
          endDate: '',
          totalCost: 0,
          paidAmount: 0,
          status: 'pending',
          pickupLocation: '',
          dropoffLocation: '',
          customerInsurancetype: '',
          customerInsuranceNumber: '',
          paymentType: 'full',
          extras: {
            insurance: false,
            insuranceCost: 0,
            gps: false,
            childSeat: false,
            chauffer: false,
            travelKit: false
          }
        });
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSearchedBookings = useMemo(() => {
    return bookingsData
      .filter(booking => {
        const matchesSearch = (
          booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.carId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.carDetails?.maker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.carDetails?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.totalCost.toString().includes(searchTerm.toLowerCase())
        );

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        const bookingDate = new Date(booking.startDate);
        const filterStartDate = startDateFilter ? new Date(startDateFilter) : null;
        const filterEndDate = endDateFilter ? new Date(endDateFilter) : null;

        const matchesDateRange = (
          (!filterStartDate || bookingDate >= filterStartDate) &&
          (!filterEndDate || bookingDate <= filterEndDate)
        );

        return matchesSearch && matchesStatus && matchesDateRange;
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;

        let aValue = a[sortConfig.key as keyof Booking];
        let bValue = b[sortConfig.key as keyof Booking];

        if (typeof aValue === 'undefined' || typeof bValue === 'undefined') return 0;

        if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          aValue = new Date(aValue as string).getTime();
          bValue = new Date(bValue as string).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [bookingsData, searchTerm, statusFilter, startDateFilter, endDateFilter, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Booking Transactions
            </h4>
            <Sheet 
              open={isAddingBooking} 
              onOpenChange={(open) => {
                setIsAddingBooking(open);
                if (!open) {
                  setNewBooking({
                    customerId: '',
                    carId: '',
                    startDate: '',
                    endDate: '',
                    totalCost: 0,
                    paidAmount: 0,
                    status: 'pending',
                    pickupLocation: '',
                    dropoffLocation: '',
                    customerInsurancetype: '',
                    customerInsuranceNumber: '',
                    paymentType: 'full',
                    extras: {
                      insurance: false,
                      insuranceCost: 0,
                      gps: false,
                      childSeat: false,
                      chauffer: false,
                      travelKit: false
                    }
                  });
                }
              }}
            >
              <SheetTrigger asChild>
                <Button variant="outline">Add Booking</Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <div className="h-full flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Add New Booking</SheetTitle>
                    <SheetDescription>
                      Enter the booking details below.
                    </SheetDescription>
                  </SheetHeader>
                  <form onSubmit={handleAddBooking} className="space-y-4 mt-4">
                    {addBookingStep === 'email' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Customer Email</label>
                          <Input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="Enter customer email"
                            required
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => fetchUserByEmail(userEmail)}
                          className="w-full"
                        >
                          Next
                        </Button>
                      </div>
                    )}

                    {addBookingStep === 'car' && (
                      <div className="space-y-4">
                        <Button
                          type="button"
                          onClick={() => {
                            setShowCarSelector(true);
                            fetchCars();
                          }}
                          className="w-full"
                        >
                          Select Car
                        </Button>
                      </div>
                    )}

                    {addBookingStep === 'details' && selectedCar && (
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg mb-4">
                          <h3 className="font-medium mb-2">Selected Car</h3>
                          <p>{selectedCar.maker} {selectedCar.model} ({selectedCar.year})</p>
                          <p className="text-sm text-gray-500">ID: {selectedCar.registrationNumber}</p>
                        </div>

                        {dateError && (
                          <div className="text-red-500 mb-4">
                            {dateError}
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium mb-2">Start Date</label>
                          <Input
                            type="datetime-local"
                            name="startDate"
                            value={newBooking.startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">End Date</label>
                          <Input
                            type="datetime-local"
                            name="endDate"
                            value={newBooking.endDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Pickup Location</label>
                          <Input
                            type="text"
                            name="pickupLocation"
                            value={newBooking.pickupLocation}
                            onChange={(e) => setNewBooking(prev => ({ ...prev, pickupLocation: e.target.value }))}
                            placeholder="Enter pickup location"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Drop-off Location</label>
                          <Input
                            type="text"
                            name="dropoffLocation"
                            value={newBooking.dropoffLocation}
                            onChange={(e) => setNewBooking(prev => ({ ...prev, dropoffLocation: e.target.value }))}
                            placeholder="Enter drop-off location"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Payment Type</label>
                          <select
                            value={newBooking.paymentType}
                            onChange={(e) => setNewBooking(prev => ({ ...prev, paymentType: e.target.value }))}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                            required
                          >
                            <option value="full">Full Payment</option>
                            <option value="installment">Installment</option>
                            <option value="cash">Cash</option>
                          </select>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Insurance</h3>
                              <p className="text-sm text-gray-500">Protect your rental with coverage</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={newBooking.extras.insurance}
                              onChange={() => handleExtraChange('insurance')}
                            />
                          </div>

                          {newBooking.extras.insurance && (
                            <div>
                              <label className="block text-sm font-medium mb-2">Insurance Type</label>
                              <select
                                value={insuranceType}
                                onChange={(e) => handleInsuranceTypeChange(e.target.value)}
                                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                              >
                                <option value="basic">Basic Insurance (${insuranceOptions.basic.price}/day)</option>
                                <option value="premium">Premium Insurance (${insuranceOptions.premium.price}/day)</option>
                                <option value="comprehensive">Comprehensive Insurance (${insuranceOptions.comprehensive.price}/day)</option>
                              </select>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">GPS Navigation</h3>
                              <p className="text-sm text-gray-500">$5/day</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={newBooking.extras.gps}
                              onChange={() => handleExtraChange('gps')}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Child Seat</h3>
                              <p className="text-sm text-gray-500">$8/day</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={newBooking.extras.childSeat}
                              onChange={() => handleExtraChange('childSeat')}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Chauffer Service</h3>
                              <p className="text-sm text-gray-500">$100/day</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={newBooking.extras.chauffer}
                              onChange={() => handleExtraChange('chauffer')}
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="font-medium mb-2">Booking Summary</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Base Price (${selectedCar.pricePerDay}/day × {totalDays} days)</span>
                              <span>${(selectedCar.pricePerDay * totalDays).toFixed(2)}</span>
                            </div>
                            {newBooking.extras.insurance && (
                              <div className="flex justify-between">
                                <span>Insurance (${newBooking.extras.insuranceCost}/day × {totalDays} days)</span>
                                <span>${(newBooking.extras.insuranceCost * totalDays).toFixed(2)}</span>
                              </div>
                            )}
                            {newBooking.extras.gps && (
                              <div className="flex justify-between">
                                <span>GPS ($5/day × {totalDays} days)</span>
                                <span>${(5 * totalDays).toFixed(2)}</span>
                              </div>
                            )}
                            {newBooking.extras.childSeat && (
                              <div className="flex justify-between">
                                <span>Child Seat ($8/day × {totalDays} days)</span>
                                <span>${(8 * totalDays).toFixed(2)}</span>
                              </div>
                            )}
                            {newBooking.extras.chauffer && (
                              <div className="flex justify-between">
                                <span>Chauffer ($100/day × {totalDays} days)</span>
                                <span>${(100 * totalDays).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="border-t pt-2 font-medium flex justify-between">
                              <span>Total</span>
                              <span>${calculateTotal().display}</span>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Creating..." : "Create Booking"}
                        </Button>
                      </div>
                    )}
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search by email, car, or booking details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-[200px] rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-[200px]"
                placeholder="Start Date"
              />
              <span className="text-sm text-gray-500">to</span>
              <Input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="w-[200px]"
                placeholder="End Date"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDateFilter('');
                  setEndDateFilter('');
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        <Dialog open={showCarSelector} onOpenChange={setShowCarSelector}>
          <DialogContent className="max-w-4xl " style={{ backgroundColor: 'white' }}>
            <DialogHeader>
              <DialogTitle>Select Car</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-4 gap-4 p-4 max-h-[70vh] overflow-y-auto">
              {availableCars.map((car) => (
                <div
                  key={car._id}
                  className="border rounded-lg p-2 cursor-pointer transition-all hover:border-primary hover:bg-primary/10"
                  onClick={() => handleCarSelection(car)}
                >
                  <div className="aspect-square relative mb-2">
                    <Image
                      src={car.pictures?.[0] || '/placeholder-car.jpg'}
                      alt={`${car.maker} ${car.model}`}
                      className="object-cover w-full h-full rounded-md"
                      width={200}
                      height={200}
                    />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{car.maker} {car.model}</p>
                    <p className="text-gray-500">{car.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Customer Email {sortConfig?.key === 'customerEmail' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Car Details {sortConfig?.key === 'carId' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Start Date {sortConfig?.key === 'startDate' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                End Date {sortConfig?.key === 'endDate' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Total Cost {sortConfig?.key === 'totalCost' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Paid Amount {sortConfig?.key === 'paidAmount' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Status {sortConfig?.key === 'status' && (
                  <span className="ml-2">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSearchedBookings.map((booking, key) => (
              <tr key={booking._id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {booking.customerEmail || 'N/A'}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {booking.carDetails ? (
                    <div>
                      <div className="font-medium">
                        {booking.carDetails.maker} {booking.carDetails.model} {booking.carDetails.year}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {booking.carId}
                      </div>
                    </div>
                  ) : (
                    booking.carId
                  )}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {new Date(booking.startDate).toLocaleDateString()}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {new Date(booking.endDate).toLocaleDateString()}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  ${booking.totalCost.toFixed(2)}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  ${booking.paidAmount.toFixed(2)}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {booking.status}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <Sheet 
                      open={editingBooking?._id === booking._id} 
                      onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setEditingBooking(null);
                        }
                      }}
                    >
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                          Edit
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="overflow-y-auto">
                        <div className="h-full flex flex-col">
                          <SheetHeader>
                            <SheetTitle>Edit Booking</SheetTitle>
                            <SheetDescription>
                              Make changes to the booking details below.
                            </SheetDescription>
                          </SheetHeader>
                          {editingBooking && (
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Start Date</label>
                                <Input
                                  type="datetime-local"
                                  value={editingBooking.startDate}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    startDate: e.target.value
                                  })}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">End Date</label>
                                <Input
                                  type="datetime-local"
                                  value={editingBooking.endDate}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    endDate: e.target.value
                                  })}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Pickup Location</label>
                                <Input
                                  type="text"
                                  value={editingBooking.pickupLocation}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    pickupLocation: e.target.value
                                  })}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Drop-off Location</label>
                                <Input
                                  type="text"
                                  value={editingBooking.dropoffLocation}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    dropoffLocation: e.target.value
                                  })}
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                  value={editingBooking.status}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    status: e.target.value
                                  })}
                                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                                  required
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="completed">Completed</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">Payment Type</label>
                                <select
                                  value={editingBooking.paymentType}
                                  onChange={(e) => setEditingBooking({
                                    ...editingBooking,
                                    paymentType: e.target.value
                                  })}
                                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
                                  required
                                >
                                  <option value="full">Full Payment</option>
                                  <option value="installment">Installment</option>
                                  <option value="cash">Cash</option>
                                </select>
                              </div>

                              <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                              </Button>
                            </form>
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCopyBooking(booking)}
                    >
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(booking)}
                    >
                      {booking.status === 'cancelled' ? 'Delete' : 'Cancel'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;
