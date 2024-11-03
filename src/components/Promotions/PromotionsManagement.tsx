"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Input } from "../ui/input";
import axios from "axios";
import PromotionsAdd from "./promotionsAdd";
import { Promotion } from "@/types/Promotion";
import React from "react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

const PromotionsManagement = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isEditingPromotion, setIsEditingPromotion] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Fetch promotions
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "promotions:getAllPromotions",
        args: {}
      });
      if (response.data) {
        setPromotions(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to fetch promotions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handlePromotionAdded = () => {
    fetchPromotions(); // Refresh the list when a new promotion is added
  };

  const handleEdit = async (promotion: Promotion) => {
    setEditingPromotion({ ...promotion });
    setIsEditingPromotion(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mutation`, {
        path: "promotions:deletePromotion",
        args: { id }
      });
      if (response.data) {
        fetchPromotions(); // Refresh the list after deletion
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setError('Failed to delete promotion. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingPromotion) {
      setLoading(true);
      setError(null);
      try {
        // Only send the fields that are defined in the mutation schema
        const updateData = {
          id: editingPromotion._id, // This should be the Convex ID
          promotionTitle: editingPromotion.promotionTitle,
          promotionDescription: editingPromotion.promotionDescription,
          promotionImage: editingPromotion.promotionImage,
          promotionType: editingPromotion.promotionType as 'discount' | 'offer' | 'upgrade' | 'permenant',
          promotionValue: editingPromotion.promotionValue,
          promotionStartDate: editingPromotion.promotionStartDate,
          promotionEndDate: editingPromotion.promotionEndDate,
          status: editingPromotion.status as 'active' | 'inactive' | 'expired' | 'scheduled',
          goldenMembersOnly: editingPromotion.goldenMembersOnly,
          target: editingPromotion.target as 'all' | 'specific' | 'none',
          specificTarget: editingPromotion.specificTarget,
        };

        const response = await axios.post(`${API_BASE_URL}/mutation`, {
          path: "promotions:updatePromotion",
          args: updateData // Send the entire object as args
        });

        if (response.data) {
          setIsEditingPromotion(false);
          fetchPromotions(); // Refresh the list after update
        }
      } catch (err) {
        console.error('Error updating promotion:', err);
        setError('Failed to update promotion. Please try again.');
      } finally {
        setLoading(false);
      }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setEditingPromotion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">Promotions Overview</h4>
        <PromotionsAdd onPromotionAdded={handlePromotionAdded} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Image</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Title</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Type</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Value</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Duration</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <React.Fragment key={promotion._id}>
                  <tr className="border-b border-stroke dark:border-strokedark">
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(promotion._id)}
                      >
                        {expandedRows.has(promotion._id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                    <td className="py-3 px-4">
                      {promotion.promotionImage && (
                        <img 
                          src={promotion.promotionImage} 
                          alt={promotion.promotionTitle}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </td>
                    <td className="py-3 px-4">{promotion.promotionTitle}</td>
                    <td className="py-3 px-4">{promotion.promotionType}</td>
                    <td className="py-3 px-4">{promotion.promotionValue}</td>
                    <td className="py-3 px-4">
                      {promotion.promotionType === 'permenant' ? (
                        <div>
                          <div>Min. Rentals: {promotion.minimumRentals}</div>
                          <div>Min. Spent: ${promotion.minimumMoneySpent}</div>
                        </div>
                      ) : (
                        <div>
                          <div>Start: {new Date(promotion.promotionStartDate).toLocaleDateString()}</div>
                          <div>End: {new Date(promotion.promotionEndDate).toLocaleDateString()}</div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{promotion.status}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <Sheet open={isEditingPromotion} onOpenChange={setIsEditingPromotion}>
                        <SheetTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                            Edit
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto">
                          <div className="h-full flex flex-col">
                            <SheetHeader>
                              <SheetTitle>Edit Promotion</SheetTitle>
                              <SheetDescription>
                                Make changes to the promotion details below.
                              </SheetDescription>
                            </SheetHeader>
                            {editingPromotion && (
                              <form onSubmit={handleSubmit} className="space-y-4 mt-4 flex-grow overflow-y-auto">
                                <div>
                                  <label htmlFor="promotionTitle" className="text-sm font-medium">Title</label>
                                  <Input
                                    id="promotionTitle"
                                    name="promotionTitle"
                                    value={editingPromotion.promotionTitle}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="promotionDescription" className="text-sm font-medium">Description</label>
                                  <Input
                                    id="promotionDescription"
                                    name="promotionDescription"
                                    value={editingPromotion.promotionDescription}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="promotionType" className="text-sm font-medium">Type</label>
                                  <select
                                    id="promotionType"
                                    name="promotionType"
                                    value={editingPromotion.promotionType}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                  >
                                    <option value="discount">Discount</option>
                                    <option value="offer">Offer</option>
                                    <option value="upgrade">Upgrade</option>
                                    <option value="permenant">Permanent</option>
                                  </select>
                                </div>
                                <div>
                                  <label htmlFor="promotionValue" className="text-sm font-medium">Value</label>
                                  <Input
                                    id="promotionValue"
                                    name="promotionValue"
                                    type="number"
                                    value={editingPromotion.promotionValue}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                {editingPromotion.promotionType === 'permenant' ? (
                                  <>
                                    <div>
                                      <label htmlFor="minimumRentals" className="text-sm font-medium">
                                        Minimum Rentals Required ({editingPromotion.minimumRentals})
                                      </label>
                                      <input
                                        id="minimumRentals"
                                        name="minimumRentals"
                                        type="range"
                                        min="0"
                                        max="20"
                                        value={editingPromotion.minimumRentals}
                                        onChange={handleInputChange}
                                        className="w-full"
                                        required
                                      />
                                    </div>

                                    <div>
                                      <label htmlFor="minimumMoneySpent" className="text-sm font-medium">
                                        Minimum Money Spent ($)
                                      </label>
                                      <Input
                                        id="minimumMoneySpent"
                                        name="minimumMoneySpent"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editingPromotion.minimumMoneySpent}
                                        onChange={handleInputChange}
                                        required
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <label htmlFor="promotionStartDate" className="text-sm font-medium">Start Date</label>
                                      <Input
                                        id="promotionStartDate"
                                        name="promotionStartDate"
                                        type="date"
                                        value={editingPromotion.promotionStartDate}
                                        onChange={handleInputChange}
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="promotionEndDate" className="text-sm font-medium">End Date</label>
                                      <Input
                                        id="promotionEndDate"
                                        name="promotionEndDate"
                                        type="date"
                                        value={editingPromotion.promotionEndDate}
                                        onChange={handleInputChange}
                                        required
                                      />
                                    </div>
                                  </>
                                )}
                                <div>
                                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                                  <select
                                    id="status"
                                    name="status"
                                    value={editingPromotion.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                  >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="expired">Expired</option>
                                    <option value="scheduled">Scheduled</option>
                                  </select>
                                </div>
                                <div className="flex items-center">
                                  <label htmlFor="goldenMembersOnly" className="text-sm font-medium mr-2">
                                    Golden Members Only
                                  </label>
                                  <input
                                    id="goldenMembersOnly"
                                    name="goldenMembersOnly"
                                    type="checkbox"
                                    checked={editingPromotion.goldenMembersOnly}
                                    onChange={handleInputChange}
                                  />
                                </div>
                                <div>
                                  <label htmlFor="target" className="text-sm font-medium">Target</label>
                                  <select
                                    id="target"
                                    name="target"
                                    value={editingPromotion.target}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-2 border rounded"
                                  >
                                    <option value="all">All</option>
                                    <option value="specific">Specific</option>
                                    <option value="none">None</option>
                                  </select>
                                </div>
                                {editingPromotion.target === 'specific' && (
                                  <div>
                                    <label htmlFor="specificTarget" className="text-sm font-medium">
                                      Specific Targets (comma-separated)
                                    </label>
                                    <Input
                                      id="specificTarget"
                                      name="specificTarget"
                                      value={editingPromotion.specificTarget.join(", ")}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                )}
                                <div>
                                  <label htmlFor="promotionImage" className="text-sm font-medium">
                                    Promotion Image
                                  </label>
                                  <input
                                    id="promotionImage"
                                    name="promotionImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                  />
                                  {editingPromotion.promotionImage && (
                                    <img 
                                      src={editingPromotion.promotionImage} 
                                      alt="Current promotion image"
                                      className="mt-2 h-20 object-cover rounded"
                                    />
                                  )}
                                </div>
                                {error && <p className="text-red-500">{error}</p>}
                                <div className="mt-4">
                                  <Button
                                    type="submit"
                                    className="text-white w-full"
                                    disabled={loading}
                                  >
                                    {loading ? "Saving..." : "Save Changes"}
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
                        onClick={() => handleDelete(promotion._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                  {expandedRows.has(promotion._id) && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan={8} className="py-3 px-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p><strong>Title:</strong> {promotion.promotionTitle}</p>
                            <p><strong>Description:</strong> {promotion.promotionDescription}</p>
                            <p><strong>Type:</strong> {promotion.promotionType}</p>
                            <p><strong>Value:</strong> {promotion.promotionValue}</p>
                          </div>
                          <div>
                            {promotion.promotionType === 'permenant' ? (
                              <>
                                <p><strong>Minimum Rentals:</strong> {promotion.minimumRentals}</p>
                                <p><strong>Minimum Money Spent:</strong> ${promotion.minimumMoneySpent}</p>
                              </>
                            ) : (
                              <>
                                <p><strong>Start Date:</strong> {new Date(promotion.promotionStartDate).toLocaleDateString()}</p>
                                <p><strong>End Date:</strong> {new Date(promotion.promotionEndDate).toLocaleDateString()}</p>
                              </>
                            )}
                            <p><strong>Golden Members Only:</strong> {promotion.goldenMembersOnly ? 'Yes' : 'No'}</p>
                            <p><strong>Target:</strong> {promotion.target}</p>
                            {promotion.target === 'specific' && (
                              <p><strong>Specific Targets:</strong> {promotion.specificTarget.join(', ')}</p>
                            )}
                          </div>
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

export default PromotionsManagement; 