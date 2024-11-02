"use client"

import React, { useState, useEffect } from "react";
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
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface PaymentTransaction {
  _id: string;
  receiptNumber: string;
  bookingId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  paymentIntentId: string;
  bookingDetails?: {
    customerId: string;
    customerName?: string;
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
}

const PaymentTransactions = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    bookingId: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentType: "",
  });
  const [newPaymentBookingDetails, setNewPaymentBookingDetails] = useState<any>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "payment:getAllPayments",
        args: {}
      });

      if (response.data) {
        const paymentsWithDetails = await Promise.all(
          response.data.value.map(async (payment: PaymentTransaction) => {
            const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
              path: "bookings:getBookingDetails",
              args: { bookingId: payment.bookingId }
            });
            
            const bookingDetails = bookingResponse.data.value;
            
            if (bookingDetails?.customerId) {
              const customerResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "customers:getCustomerByUserId",
                args: { userId: bookingDetails.customerId }
              });
              
              const userResponse = await axios.post(`${API_BASE_URL}/query`, {
                path: "users:getFullUser",
                args: { userId: bookingDetails.customerId }
              });
              
              const user = userResponse.data.value;
              bookingDetails.customerName = user ? 
                `${user.firstName} ${user.lastName}` : 
                'N/A';
            }
            
            return {
              ...payment,
              bookingDetails
            };
          })
        );
        
        setTransactions(paymentsWithDetails);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleEdit = (transaction: PaymentTransaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditingTransaction(true);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingTransaction) return;
    const { name, value } = e.target;
    
    setEditingTransaction(prev => ({ ...prev, [name]: value }));

    // If bookingId changes, fetch new booking details
    if (name === 'bookingId') {
      try {
        const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
          path: "bookings:getBookingDetails",
          args: { bookingId: value }
        });
        
        if (bookingResponse.data.value) {
          const bookingData = bookingResponse.data.value;
          
          const userResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "users:getFullUser",
            args: { userId: bookingData.customerId }
          });
          
          const userData = userResponse.data.value;
          
          setEditingTransaction(prev => ({
            ...prev,
            bookingDetails: {
              ...bookingData,
              customerName: userData ? `${userData.firstName} ${userData.lastName}` : 'N/A'
            }
          }));
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingTransaction) {
      setLoading(true);
      setError(null);
      try {
        // Get current booking details
        const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
          path: "bookings:getBookingDetails",
          args: { bookingId: editingTransaction.bookingId }
        });
        
        const bookingDetails = bookingResponse.data.value;
        
        // Calculate amount difference
        const oldAmount = transactions.find(t => t._id === editingTransaction._id)?.amount || 0;
        const amountDifference = parseFloat(editingTransaction.amount) - oldAmount;

        // Update payment
        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "payment:editPayment",
          args: {
            paymentId: editingTransaction._id,
            bookingId: editingTransaction.bookingId,
            amount: parseFloat(editingTransaction.amount),
            paymentDate: editingTransaction.paymentDate,
            paymentType: editingTransaction.paymentType,
          }
        });

        if (response.data) {
          // Calculate new status and paid amount
          const newPaidAmount = (bookingDetails.paidAmount || 0) + amountDifference;
          let newStatus = bookingDetails.status;

          if (bookingDetails.status === 'pending') {
            newStatus = 'inprogress';
          } else if (newPaidAmount >= bookingDetails.totalCost) {
            newStatus = 'completed';
          }

          // Update booking status and paid amount
          await axios.post(`${API_BASE_URL}/mutation`, {
            path: "bookings:updateBooking",
            args: {
              id: editingTransaction.bookingId,
              status: newStatus,
              paidAmount: newPaidAmount
            }
          });

          fetchPayments();
          setEditingTransaction(null);
          setIsEditingTransaction(false);
        }
      } catch (err) {
        console.error('Error updating payment:', err);
        setError('Failed to update payment. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (receiptNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "payment:RefundPayment",
        args: { receiptNumber }
      });
      if (response.data) {
        fetchPayments();
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPaymentInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: value }));

    // If bookingId changes, fetch booking details
    if (name === 'bookingId') {
      try {
        const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
          path: "bookings:getBookingDetails",
          args: { bookingId: value }
        });
        
        if (bookingResponse.data.value) {
          const bookingData = bookingResponse.data.value;
          
          // Fetch user details for customer name
          const userResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "users:getFullUser",
            args: { userId: bookingData.customerId }
          });
          
          const userData = userResponse.data.value;
          
          setNewPaymentBookingDetails({
            ...bookingData,
            customerName: userData ? `${userData.firstName} ${userData.lastName}` : 'N/A'
          });
        } else {
          setNewPaymentBookingDetails(null);
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setNewPaymentBookingDetails(null);
      }
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current booking details
      const bookingResponse = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getBookingDetails",
        args: { bookingId: newPayment.bookingId }
      });
      
      const bookingDetails = bookingResponse.data.value;
      
      // Create payment
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "payment:createPayment",
        args: {
          bookingId: newPayment.bookingId,
          amount: parseFloat(newPayment.amount),
          paymentDate: newPayment.paymentDate,
          paymentType: newPayment.paymentType,
        }
      });

      if (response.data) {
        // Calculate new status and paid amount
        const newPaidAmount = (bookingDetails.paidAmount || 0) + parseFloat(newPayment.amount);
        let newStatus = bookingDetails.status;

        if (bookingDetails.status === 'pending') {
          newStatus = 'inprogress';
        } else if (newPaidAmount >= bookingDetails.totalCost) {
          newStatus = 'completed';
        }

        // Update booking status and paid amount
        await axios.post(`${API_BASE_URL}/mutation`, {
          path: "bookings:updateBooking",
          args: {
            id: newPayment.bookingId,
            status: newStatus,
            paidAmount: newPaidAmount
          }
        });

        fetchPayments();
        setIsAddingPayment(false);
        setNewPayment({
          bookingId: "",
          amount: "",
          paymentDate: new Date().toISOString().split('T')[0],
          paymentType: "",
        });
        setNewPaymentBookingDetails(null);
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setError('Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Payment Transactions</h4>
        <Sheet open={isAddingPayment} onOpenChange={setIsAddingPayment}>
          <SheetTrigger asChild>
            <Button variant="outline">Add Payment</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add New Payment</SheetTitle>
              <SheetDescription>
                Enter the payment details below.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleAddPayment} className="space-y-4 mt-4">
              <div>
                <label htmlFor="bookingId" className="text-sm font-medium">Booking ID</label>
                <Input
                  id="bookingId"
                  name="bookingId"
                  value={newPayment.bookingId}
                  onChange={handleNewPaymentInputChange}
                  required
                />
              </div>

              {newPaymentBookingDetails && (
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p><strong>Customer ID:</strong> {newPaymentBookingDetails.customerId}</p>
                  <p><strong>Customer Name:</strong> {newPaymentBookingDetails.customerName}</p>
                  <p><strong>Car ID:</strong> {newPaymentBookingDetails.carId}</p>
                </div>
              )}

              <div>
                <label htmlFor="amount" className="text-sm font-medium">Amount</label>
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

              <div>
                <label htmlFor="paymentType" className="text-sm font-medium">Payment Type</label>
                <select
                  id="paymentType"
                  name="paymentType"
                  value={newPayment.paymentType}
                  onChange={handleNewPaymentInputChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Payment Type</option>
                  <option value="credit card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Payment"}
              </Button>
            </form>
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
                <th className="py-4 px-4 font-medium text-black dark:text-white">Receipt Number</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Customer Name</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Car ID</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Amount</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Payment Type</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Payment Date</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b border-stroke dark:border-strokedark">
                  <td className="py-3 px-4">{transaction.receiptNumber}</td>
                  <td className="py-3 px-4">{transaction.bookingDetails?.customerName}</td>
                  <td className="py-3 px-4">{transaction.bookingDetails?.carId}</td>
                  <td className="py-3 px-4">${transaction.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{transaction.paymentType}</td>
                  <td className="py-3 px-4">{new Date(transaction.paymentDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 flex space-x-2">
                    <Sheet open={isEditingTransaction} onOpenChange={setIsEditingTransaction}>
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
                                  <p><strong>Customer Name:</strong> {editingTransaction.bookingDetails.customerName}</p>
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
                                  <option value="credit card">Credit Card</option>
                                  <option value="paypal">PayPal</option>
                                  <option value="cash">Cash</option>
                                </select>
                              </div>

                              {error && <p className="text-red-500">{error}</p>}

                              <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                              >
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
                      onClick={() => handleDelete(transaction.receiptNumber)}
                    >
                      Delete
                    </Button>
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
