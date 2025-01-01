"use client"

import { useQuery } from '@tanstack/react-query';
import axios from "axios";
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
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface PaymentTransaction {
  _id: string;
  receiptNumber: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  paymentIntentId: string;
  isSubscription: boolean;
  bookingDetails?: {
    customerId: string;
    customerEmail?: string;
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
    carDetails?: {
      maker: string;
      model: string;
      year: number;
      registrationNumber: string;
    };
  };
}

interface UserBooking {
  _id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  carDetails: {
    maker: string;
    model: string;
    year: number;
    registrationNumber: string;
    color: string;
    pricePerDay: number;
  };
  paidAmount: number;
}

interface BookingDetails {
  _id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: string;
  carDetails: {
    maker: string;
    model: string;
    year: number;
    registrationNumber: string;
    color: string;
    pricePerDay: number;
  };
  paidAmount: number;
}

const PaymentTransactions = () => {
  const [editingTransaction, setEditingTransaction] = useState<PaymentTransaction | null>(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    bookingId: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: "",
  });
  const [newPaymentBookingDetails, setNewPaymentBookingDetails] = useState<any>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [addPaymentStep, setAddPaymentStep] = useState<'email' | 'bookings' | 'payment'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPaymentType, setSelectedPaymentType] = useState('');

  const renderCarDetails = (carDetails: UserBooking['carDetails']) => {
    return `${carDetails.maker} ${carDetails.model} ${carDetails.year}`;
  };

  const fetchAllPayments = async () => {
    try {
      console.log('Fetching payments...');
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "payment:getAllPayments",
        args: {}
      });

      if (!response.data) {
        console.error('No data received from payments query');
        return [];
      }

      const paymentsWithDetails = await Promise.all(
        response.data.value.map(async (payment: PaymentTransaction) => {
          try {
            const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
              path: "bookings:getBookingDetails",
              args: { bookingId: payment.bookingId }
            });
            
            const bookingDetails = bookingResponse.data.value;
            
            if (bookingDetails?.customerId) {
              const userResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "users:getFullUser",
                args: { userId: bookingDetails.customerId }
              });
              
              const user = userResponse.data.value;
              bookingDetails.customerEmail = user ? user.email : 'N/A';

              const carResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "car:getCar",
                args: { registrationNumber: bookingDetails.carId }
              });

              if (carResponse.data?.value) {
                bookingDetails.carDetails = carResponse.data.value;
              }
            }
            
            return {
              ...payment,
              bookingDetails
            };
          } catch (err) {
            console.error(`Error fetching details for payment ${payment._id}:`, err);
            return payment;
          }
        })
      );
      
      return paymentsWithDetails;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  };

  const { 
    data: transactions = [], 
    isLoading, 
    isError, 
    error,
    refetch: fetchPayments
  } = useQuery<PaymentTransaction[], Error>({
    queryKey: ['payments'],
    queryFn: fetchAllPayments,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const handleEdit = (transaction: PaymentTransaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditingTransaction(transaction._id);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingTransaction) return;
    const { name, value } = e.target;
    
    setEditingTransaction(prev => 
      prev ? { ...prev, [name]: value } as PaymentTransaction : null
    );

    if (name === 'bookingId' && value !== editingTransaction.bookingId) {
      try {
        const response = await axios.post(`${API_BASE_URL}/query`, {
          path: "bookings:getBookingWithUserDetails",
          args: { bookingId: value }
        });
        
        if (response.data?.value) {
          const { bookingData, userData } = response.data.value;
          
          setEditingTransaction(prev => 
            prev ? {
              ...prev,
              bookingDetails: {
                ...bookingData,
                customerName: userData ? `${userData.firstName} ${userData.lastName}` : 'N/A'
              }
            } as PaymentTransaction : null
          );
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setLocalLoading(true);
    setLocalError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "payment:editPayment",
        args: {
          paymentId: editingTransaction._id,
          bookingId: editingTransaction.bookingId,
          amount: editingTransaction.amount.toString(),
          paymentDate: editingTransaction.paymentDate,
          paymentType: editingTransaction.paymentType,
        }
      });

      if (response.data) {
        // Update booking status
        const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
          path: "bookings:getBookingDetails",
          args: { bookingId: editingTransaction.bookingId }
        });
        
        const bookingDetails = bookingResponse.data.value;
        const oldAmount = transactions.find((t: PaymentTransaction) => t._id === editingTransaction._id)?.amount || 0;
        const amountDifference = parseFloat(editingTransaction.amount.toString()) - oldAmount;
        
        const newPaidAmount = (bookingDetails.paidAmount || 0) + amountDifference;
        let newStatus = bookingDetails.status;

        if (bookingDetails.status === 'pending') {
          newStatus = 'inprogress';
        } else if (newPaidAmount >= bookingDetails.totalCost) {
          newStatus = 'completed';
        }

        await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:updateBooking",
          args: {
            id: editingTransaction.bookingId,
            status: newStatus,
            paidAmount: newPaidAmount
          }
        });

        await fetchPayments(); // Explicitly refetch payments
        setEditingTransaction(null);
        setIsEditingTransaction(null);
      }
    } catch (err) {
      console.error('Error updating payment:', err);
      setLocalError('Failed to update payment. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (receiptNumber: string) => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "payment:RefundPayment",
        args: { receiptNumber }
      });
      if (response.data) {
        await fetchPayments(); // Explicitly refetch payments
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
      setLocalError('Failed to delete payment. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const fetchUserBookings = async (email: string) => {
    try {
      // First get the user by email
      const userResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "users:getUserByEmail",
        args: { email }
      });

      if (!userResponse.data?.value) {
        setLocalError('No user found with this email.');
        return;
      }

      // Then get their bookings
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getBookingsByCustomer",
        args: { customerId: userResponse.data.value.userId }
      });

      if (response.data?.value) {
        // Fetch car details for each booking
        const bookingsWithDetails = await Promise.all(
          response.data.value.map(async (booking: UserBooking) => {
            try {
              const carResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "car:getCar",
                args: { registrationNumber: booking.carId }
              });

              if (carResponse.data?.value) {
                return {
                  ...booking,
                  carDetails: carResponse.data.value,
                  paidAmount: booking.paidAmount || 0
                };
              }
              return booking;
            } catch (err) {
              console.error('Error fetching car details:', err);
              return booking;
            }
          })
        );
        setUserBookings(bookingsWithDetails);
        setAddPaymentStep('bookings');
      } else {
        setLocalError('No bookings found for this customer.');
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setLocalError('Failed to fetch bookings. Please try again.');
    }
  };

  const handleNewPaymentInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setUserEmail(value);
      return;
    }

    setNewPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSelect = (booking: UserBooking) => {
    setSelectedBooking(booking);
    setNewPayment({
      bookingId: booking._id,
      amount: (booking.totalCost - booking.paidAmount).toString(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentType: "cash", // Enforce cash payment
    });
    setAddPaymentStep('payment');
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    try {
      const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getBookingDetails",
        args: { bookingId: newPayment.bookingId }
      });
      
      if (!bookingResponse.data?.value) {
        throw new Error('Booking details not found');
      }

      const bookingDetails = bookingResponse.data.value;
      
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "payment:createPayment",
        args: {
          bookingId: newPayment.bookingId,
          amount: parseFloat(newPayment.amount),
          paymentDate: newPayment.paymentDate,
          paymentType: "cash", // Enforce cash payment
        }
      });

      if (response.data) {
        // Calculate new paid amount, defaulting to 0 if paidAmount is undefined
        const currentPaidAmount = bookingDetails.paidAmount || 0;
        const newPaidAmount = currentPaidAmount + parseFloat(newPayment.amount);
        let newStatus = bookingDetails.status;

        if (bookingDetails.status === 'pending') {
          newStatus = 'inprogress';
        } else if (newPaidAmount >= bookingDetails.totalCost) {
          newStatus = 'completed';
        }

        await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:updateBooking",
          args: {
            id: newPayment.bookingId,
            status: newStatus,
            paidAmount: newPaidAmount
          }
        });

        await fetchPayments(); // Explicitly refetch payments
        setIsAddingPayment(false);
        setNewPayment({
          bookingId: "",
          amount: "",
          paymentDate: new Date().toISOString().split('T')[0],
          paymentType: "cash",
        });
        setNewPaymentBookingDetails(null);
        setAddPaymentStep('email');
        setUserEmail('');
        setUserBookings([]);
        setSelectedBooking(null);
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setLocalError('Failed to create payment. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const renderBookingCards = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="text-sm font-medium mb-2">Select a Booking</div>
        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {userBookings.map((booking) => (
            <div
              key={booking._id}
              onClick={() => handleBookingSelect(booking)}
              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Booking ID: {booking._id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="text-base font-semibold">
                  {`${booking.carDetails.maker} ${booking.carDetails.model} ${booking.carDetails.year}`}
                </div>
                <div className="text-sm text-gray-500">
                  Reg: {booking.carDetails.registrationNumber}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">${booking.totalCost.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">
                      Paid: ${booking.paidAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">
                  Remaining: ${(booking.totalCost - booking.paidAmount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setAddPaymentStep('email');
            setUserEmail('');
            setUserBookings([]);
          }}
        >
          Back to Email
        </Button>
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!selectedBooking) return null;

    return (
      <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
        <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{renderCarDetails(selectedBooking.carDetails)}</h3>
              <p className="text-sm text-gray-500">
                Start Date: {new Date(selectedBooking.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Total: ${selectedBooking.totalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Paid: ${selectedBooking.paidAmount.toFixed(2)}</p>
              <p className="text-sm font-medium text-primary">
                Remaining: ${(selectedBooking.totalCost - selectedBooking.paidAmount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="text-sm font-medium">Payment Amount</label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={newPayment.amount}
            onChange={handleNewPaymentInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="paymentDate" className="text-sm font-medium">Payment Date</label>
          <Input
            id="paymentDate"
            name="paymentDate"
            type="date"
            value={newPayment.paymentDate}
            onChange={handleNewPaymentInputChange}
            required
          />
        </div>

        <input type="hidden" name="paymentType" value="cash" />

        {localError && <p className="text-red-500">{localError}</p>}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setAddPaymentStep('bookings');
              setSelectedBooking(null);
            }}
          >
            Back to Bookings
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={localLoading}
          >
            {localLoading ? "Creating..." : "Create Payment"}
          </Button>
        </div>
      </form>
    );
  };

  const renderAddPaymentForm = () => {
    switch (addPaymentStep) {
      case 'email':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            fetchUserBookings(userEmail);
          }} className="space-y-4 mt-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">Customer Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={userEmail}
                onChange={handleNewPaymentInputChange}
                required
                placeholder="Enter customer email"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={localLoading}
            >
              {localLoading ? "Searching..." : "Find Bookings"}
            </Button>
          </form>
        );

      case 'bookings':
        return renderBookingCards();

      case 'payment':
        return renderPaymentForm();

      default:
        return null;
    }
  };

  const filteredTransactions = transactions.filter((transaction: PaymentTransaction) => {
    const matchesSearch = searchTerm === '' || 
      transaction.bookingDetails?.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.bookingDetails?.carDetails?.maker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.bookingDetails?.carDetails?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.bookingDetails?.carDetails?.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentType = selectedPaymentType === '' || 
      transaction.paymentType.toLowerCase() === selectedPaymentType.toLowerCase();

    const matchesDateRange = (!dateRange.start || new Date(transaction.paymentDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(transaction.paymentDate) <= new Date(dateRange.end));

    return matchesSearch && matchesPaymentType && matchesDateRange;
  });

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Payment Transactions</h4>
        <Sheet 
          open={isAddingPayment} 
          onOpenChange={(open) => {
            setIsAddingPayment(open);
            if (!open) {
              setAddPaymentStep('email');
              setUserEmail('');
              setUserBookings([]);
              setSelectedBooking(null);
            }
          }}
        >
          <SheetTrigger asChild>
            <Button variant="outline">Add Payment</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>Add New Payment</SheetTitle>
              <SheetDescription>
                {addPaymentStep === 'email' && "Enter the customer's email to find their bookings."}
                {addPaymentStep === 'bookings' && "Select a booking to add a payment."}
                {addPaymentStep === 'payment' && "Enter payment details."}
              </SheetDescription>
            </SheetHeader>
            {renderAddPaymentForm()}
          </SheetContent>
        </Sheet>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by email, car, or receipt number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-[200px]">
            <select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Payment Types</option>
              <option value="full">Full Payment</option>
              <option value="installment">Installment</option>
              <option value="stripe">Stripe</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[200px]">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full"
              />
            </div>
            <span>to</span>
            <div className="w-[200px]">
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setDateRange({ start: '', end: '' });
              setSelectedPaymentType('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {localLoading && <p>Loading...</p>}
      {localError && <p className="text-red-500">{localError}</p>}

      {!localLoading && !localError && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">Receipt Number</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Customer Email</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Car Details</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Amount</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Payment Type</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Payment Date</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction: PaymentTransaction) => (
                <tr key={transaction._id} className="border-b border-stroke dark:border-strokedark">
                  <td className="py-3 px-4">{transaction.receiptNumber}</td>
                  <td className="py-3 px-4">
                    {transaction.isSubscription 
                      ? "(subscription)" 
                      : transaction.bookingDetails?.customerEmail}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.isSubscription 
                      ? "(subscription)"
                      : transaction.bookingDetails?.carDetails ? (
                        <div>
                          <div className="font-medium">
                            {transaction.bookingDetails.carDetails.maker} {transaction.bookingDetails.carDetails.model} {transaction.bookingDetails.carDetails.year}
                          </div>
                          <div className="text-sm text-gray-500">
                            Reg: {transaction.bookingDetails.carDetails.registrationNumber}
                          </div>
                        </div>
                      ) : (
                        transaction.bookingDetails?.carId
                      )
                    }
                  </td>
                  <td className="py-3 px-4">${transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{transaction.paymentType}</td>
                  <td className="py-3 px-4">{new Date(transaction.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    {!transaction.isSubscription && (
                      <>
                        <Sheet 
                          open={isEditingTransaction === transaction._id} 
                          onOpenChange={(isOpen: boolean) => {
                            if (!isOpen) {
                              setIsEditingTransaction(null);
                            }
                          }}
                        >
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                              Edit
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="overflow-y-auto">
                            <div className="h-full flex flex-col">
                              <SheetHeader>
                                <SheetTitle>Edit Payment</SheetTitle>
                                <SheetDescription>
                                  Make changes to the payment details below.
                                </SheetDescription>
                              </SheetHeader>
                              {editingTransaction && (
                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                  <div>
                                    <label htmlFor="bookingId" className="text-sm font-medium">Booking ID</label>
                                    <Input
                                      id="bookingId"
                                      name="bookingId"
                                      value={editingTransaction.bookingId}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>

                                  {editingTransaction.bookingDetails && (
                                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                      <p><strong>Customer ID:</strong> {editingTransaction.bookingDetails.customerId}</p>
                                      <p><strong>Customer Email:</strong> {editingTransaction.bookingDetails.customerEmail}</p>
                                      <p><strong>Car ID:</strong> {editingTransaction.bookingDetails.carId}</p>
                                    </div>
                                  )}

                                  <div>
                                    <label htmlFor="amount" className="text-sm font-medium">Amount</label>
                                    <Input
                                      id="amount"
                                      name="amount"
                                      type="number"
                                      step="0.01"
                                      value={editingTransaction.amount}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label htmlFor="paymentDate" className="text-sm font-medium">Payment Date</label>
                                    <Input
                                      id="paymentDate"
                                      name="paymentDate"
                                      type="date"
                                      value={editingTransaction.paymentDate}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label htmlFor="paymentType" className="text-sm font-medium">Payment Type</label>
                                    <select
                                      id="paymentType"
                                      name="paymentType"
                                      value={editingTransaction.paymentType}
                                      onChange={handleInputChange}
                                      required
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <option value="">Select Payment Type</option>
                                      <option value="full">Full Payment</option>
                                      <option value="installment">Installment</option>
                                      <option value="stripe">Stripe</option>
                                      <option value="cash">Cash</option>
                                    </select>
                                  </div>

                                  {localError && <p className="text-red-500">{localError}</p>}

                                  <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={localLoading}
                                  >
                                    {localLoading ? "Saving..." : "Save Changes"}
                                  </Button>
                                </form>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(transaction.receiptNumber)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentTransactions;
