"use client"

import { Customer } from "@/types/customer1";
import axios from "axios";
import { Search, Send, Star } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "@/components/ui/switch";

interface Message {
  userId: string;
  message: string;
  isAdmin: boolean;
  timestamp: string;
  _id?: string;
}

interface ExtendedCustomer extends Customer {
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  firstName?: string;
  lastName?: string;
  goldenMember: boolean;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const CustomerSupport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [polling, setPolling] = useState<NodeJS.Timeout | null>(null);
  const [lastReadTimestamps, setLastReadTimestamps] = useState<Record<string, string>>({});
  const [showGoldenOnly, setShowGoldenOnly] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Get customers with their details
        const response = await axios.post(`${API_BASE_URL}/query`, {
          path: "customers:getAllCustomers",
          args: {}
        });

        if (response.data.value?.length) {
          // Get user details for each customer
          const userResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "users:getManyUsers",
            args: { userIds: response.data.value.map((c: { userId: string }) => c.userId) }
          });

          // Combine customer and user data
          const combinedData = response.data.value.map((customer: Customer) => {
            const user = userResponse.data.value?.find((u: any) => u.userId === customer.userId);
            return {
              ...customer,
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
              unreadCount: 0,
              lastMessage: '',
              lastMessageTime: '',
              goldenMember: customer.goldenMember || false
            };
          });

          setCustomers(combinedData);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
    // Fetch customers every 5 minutes
    const interval = setInterval(fetchCustomers, 300000);
    return () => clearInterval(interval);
  }, []);

  // Memoize the fetchMessages function
  const fetchMessages = useCallback(async () => {
    if (!selectedCustomer) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "chat:getMessagesByCustomerId",
        args: { userId: selectedCustomer }
      });
      
      if (response.data.value) {
        setMessages(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [selectedCustomer]); // Add selectedCustomer as a dependency

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
  }, [selectedCustomer, fetchMessages]); // Add fetchMessages as a dependency

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedCustomer) return;
    
    try {
      await axios.post(`${API_BASE_URL}/mutation`, {
        path: "chat:sendMessage",
        args: {
          userId: selectedCustomer,
          message: message.trim(),
          isAdmin: true,
          timestamp: new Date().toISOString(),
        }
      });
      
      setMessage("");
      await fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const updateCustomerList = async () => {
      const updatedCustomers = await Promise.all(customers.map(async (customer) => {
        try {
          // Get unread message count
          const unreadResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "analytics:getUnreadMessageCount",
            args: {
              userId: customer.userId,
              lastReadTimestamp: lastReadTimestamps[customer.userId] || '1970-01-01T00:00:00.000Z'
            }
          });

          // Get last message
          const lastMessageResponse = await axios.post(`${API_BASE_URL}/query`, {
            path: "analytics:getLastMessage",
            args: { userId: customer.userId }
          });

          const lastMessage = lastMessageResponse.data.value;
          
          return {
            ...customer,
            unreadCount: unreadResponse.data.value || 0,
            lastMessage: lastMessage?.message || "",
            lastMessageTime: lastMessage?.timestamp || "",
          };
        } catch (error) {
          console.error('Error updating customer data:', error);
          return customer;
        }
      }));

      // Sort customers: pending messages first, then golden members, then by last message time
      const sortedCustomers = updatedCustomers.sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        if (a.goldenMember !== b.goldenMember) {
          return b.goldenMember ? 1 : -1;
        }
        return new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime();
      });

      setCustomers(sortedCustomers);
    };

    updateCustomerList();
  }, [customers, lastReadTimestamps]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setLastReadTimestamps(prev => ({
      ...prev,
      [customerId]: new Date().toISOString()
    }));
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      customer.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGolden = !showGoldenOnly || customer.goldenMember;
    return matchesSearch && matchesGolden;
  });

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left sidebar - Customer list */}
        <div className="w-1/3 border-r border-stroke dark:border-strokedark">
          <div className="p-4 border-b border-stroke dark:border-strokedark">
            <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
              Customer Chats
            </h4>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showGoldenOnly}
                onCheckedChange={setShowGoldenOnly}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">Show Golden Members Only</span>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.userId}
                onClick={() => handleCustomerSelect(customer.userId)}
                className={`p-4 border-b border-stroke dark:border-strokedark cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4 ${
                  selectedCustomer === customer.userId
                    ? "bg-gray-100 dark:bg-meta-4"
                    : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-black dark:text-white">
                      {customer.firstName} {customer.lastName}
                    </h5>
                    {customer.goldenMember && (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    )}
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
                    {customer.lastMessageTime ? new Date(customer.lastMessageTime).toLocaleTimeString() : ''}
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
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-semibold text-black dark:text-white">
                    {customers.find(c => c.userId === selectedCustomer)?.firstName} {customers.find(c => c.userId === selectedCustomer)?.lastName}
                  </h4>
                  {customers.find(c => c.userId === selectedCustomer)?.goldenMember && (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-gray-500">ID: {selectedCustomer}</p>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {messages
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((msg, index) => (
                    <div 
                      key={msg._id || index} 
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
