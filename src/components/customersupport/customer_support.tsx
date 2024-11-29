"use client"

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search, Send } from "lucide-react";
import React, { useState } from "react";

interface Customer {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
}

const CustomerSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Dummy data for UI demonstration
  const customers: Customer[] = [
    {
      id: "CUST001",
      name: "John Doe",
      unreadCount: 3,
      lastMessage: "Hello, I need help with my order",
      lastMessageTime: "10:30 AM"
    },
    {
      id: "CUST002",
      name: "Jane Smith",
      unreadCount: 0,
      lastMessage: "Thank you for your help",
      lastMessageTime: "Yesterday"
    },
    // Add more dummy data as needed
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left sidebar - Customer list */}
        <div className="w-1/3 border-r border-stroke dark:border-strokedark">
          <div className="p-4 border-b border-stroke dark:border-strokedark">
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
              Customer Chats
            </h4>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 border-b border-stroke dark:border-strokedark cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4 ${
                  selectedCustomer?.id === customer.id
                    ? "bg-gray-100 dark:bg-meta-4"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-black dark:text-white">
                      {customer.name}
                    </h5>
                    <p className="text-sm text-gray-500">ID: {customer.id}</p>
                  </div>
                  {customer.unreadCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {customer.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500 truncate w-48">
                    {customer.lastMessage}
                  </p>
                  <span className="text-xs text-gray-400">
                    {customer.lastMessageTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Chat window */}
        <div className="flex-1 flex flex-col">
          {selectedCustomer ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-stroke dark:border-strokedark">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  {selectedCustomer.name}
                </h4>
                <p className="text-sm text-gray-500">ID: {selectedCustomer.id}</p>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Dummy messages for UI demonstration */}
                <div className="mb-4 flex justify-start">
                  <div className="bg-gray-100 dark:bg-meta-4 rounded-lg p-3 max-w-[70%]">
                    <p className="text-sm">Hello, I need help with my order</p>
                    <span className="text-xs text-gray-400">10:30 AM</span>
                  </div>
                </div>
                <div className="mb-4 flex justify-end">
                  <div className="bg-primary text-white rounded-lg p-3 max-w-[70%]">
                    <p className="text-sm">Hi! I'd be happy to help. Could you please provide your order number?</p>
                    <span className="text-xs text-gray-200">10:31 AM</span>
                  </div>
                </div>
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-stroke dark:border-strokedark">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button className="text-white">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a customer to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
