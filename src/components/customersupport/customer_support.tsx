"use client"

import { Customer } from "@/types/customer1";
import axios from "axios";
import { Search, Send } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// interface Customer {
//   id: string;
//   name: string;
//   unreadCount: number;
//   lastMessage: string;
//   lastMessageTime: string;
// }

interface UserDetails {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  // Add other relevant user fields as needed
}

interface Message {
  customerId: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const CustomerSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "customers:getAllCustomers",
        args: {}
      });
      setCustomers(response.data.value);

      if (response.data.value?.length) {
        const userResponse = await axios.post(`${API_BASE_URL}/query`, {
          path: "users:getManyUsers",
          args: { userIds: response.data.value.map((c: { userId: string }) => c.userId) }
        });
        setUserDetails(userResponse.data.value);
      }
    };
    fetchCustomers();
  }, []);

  const fetchMessages = async () => {
    if (!selectedCustomer) return;
    const response = await axios.post(`${API_BASE_URL}/query`, {
      path: "chat:getMessagesByCustomerId",
      args: { customerId: selectedCustomer }
    });
    setMessages(response.data.value);
  };

  useEffect(() => {
    if (selectedCustomer) {
      fetchMessages();

      const interval = setInterval(fetchMessages, 1000);
      setPolling(interval);

      return () => {
        clearInterval(interval);
        setPolling(null);
      };
    }
  }, [selectedCustomer]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedCustomer) return;
    
    await axios.post(`${API_BASE_URL}/mutation`, {
      path: "chat:sendMessage",
      args: {
        customerId: selectedCustomer,
        message: message.trim(),
        isAdmin: true,
        timestamp: new Date().toISOString(),
      }
    });
    
    setMessage("");
    await fetchMessages();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const updatedCustomerList = customers?.map(customer => {
      const user = userDetails?.find((u: UserDetails) => u.userId === customer.userId);
      const customerMessages = messages.filter(m => m.customerId === customer.userId);
      const lastMessage = customerMessages.length > 0 
        ? customerMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        : null;
      
      const lastReadTime = lastReadTimestamps[customer.userId] || '1970-01-01T00:00:00.000Z';
      const unreadCount = customerMessages.filter(
        msg => !msg.isAdmin && new Date(msg.timestamp) > new Date(lastReadTime)
      ).length;
      
      return {
        id: customer.userId,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        unreadCount,
        lastMessage: lastMessage?.message ?? "",
        lastMessageTime: lastMessage?.timestamp ?? "",
      };
    }) ?? [];
    
    setCustomerList(updatedCustomerList as Customer[]);
  }, [customers, userDetails, messages, lastReadTimestamps]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setLastReadTimestamps(prev => ({
      ...prev,
      [customerId]: new Date().toISOString()
    }));
  };

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
            {customerList.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer.id ?? '')}
                className={`p-4 border-b border-stroke dark:border-strokedark cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4 ${
                  selectedCustomer === customer.id
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
                  {customer.unreadCount && customer.unreadCount > 0 && (
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
                  {customerList.find(c => c.id === selectedCustomer)?.name}
                </h4>
                <p className="text-sm text-gray-500">ID: {selectedCustomer}</p>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((msg, index) => (
                    <div 
                      key={index} 
                      className={`mb-4 flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`rounded-lg p-3 max-w-[70%] ${
                        msg.isAdmin 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 dark:bg-meta-4'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <span className={`text-xs ${msg.isAdmin ? 'text-gray-200' : 'text-gray-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="p-4 border-t border-stroke dark:border-strokedark">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    className="text-white"
                    onClick={handleSendMessage}
                  >
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
