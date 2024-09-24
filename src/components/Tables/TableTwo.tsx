"use client"
import { Booking } from "@/types/booking";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

const productData: Booking[] = [
  {
    image: "https://res.cloudinary.com/seunsanyaa/image/upload/v1727128200/1200px-2018_Tesla_Model_S_75D-1021681115_zp5tzj.jpg",
    name: "Tesla Model S",
    category: "Model S",
    duration: '2 days',
    startDate:'12-10-2024',
    price: 15000,
    customerEmail: "john@example.com",
  },
  {
    image: "https://res.cloudinary.com/seunsanyaa/image/upload/v1727128259/7b78edbb-ford-mustang-new-york-auto-show--3073935653_hkpna5.jpg",
    name: "Ford Mustang",
    category: "Mustang",
    duration: '2 days',
    startDate:'12-10-2024',
    price: 15000,
    customerEmail: "jane@example.com",
  },
  {
    image: "https://res.cloudinary.com/seunsanyaa/image/upload/v1727128309/chevrolet_camaro_ss-5-1307904132_cctxyj.jpg",
    name: "Chevrolet Camaro",
    category: "Camaro",
    duration: '2 days',
    startDate:'12-10-2024',
    price: 15000,
    customerEmail: "bob@example.com",
  },
  {
    image: "https://res.cloudinary.com/seunsanyaa/image/upload/v1727128359/New-BMW-3-Series-3759226992_mxqucu.jpg",
    name: "BMW 3 Series",
    category: "3 Series",
    duration: '2 days',
    startDate:'12-10-2024',
    price: 15000,
    customerEmail: "alice@example.com",
  },
];

const TableTwo = () => {
  const [editingProduct, setEditingProduct] = useState<Booking | null>(null);

  const handleEdit = (booking: Booking) => {
    setEditingProduct({ ...booking });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingProduct((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: name === 'price' || name === 'sold' ? parseFloat(value) : value };
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically update the product in your backend
    console.log("Updated product:", editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark min-h-[100vh]">
      <div className="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Manage Bookings
        </h4>
      </div>

      <div className="grid grid-cols-7 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-10 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Car Name</p>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="font-medium">Model</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Duration</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Start-Date</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Price</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Customer Email</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">...</p>
        </div>
      </div>

      {productData.map((product, key) => (
        <div
          className="grid grid-cols-7 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-10 md:px-6 2xl:px-7.5"
          key={key}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-12.5 w-15 rounded-md">
                <Image
                  src={product.image}
                  width={60}
                  height={50}
                  alt="Product"
                />
              </div>
              <p className="text-sm text-black dark:text-white">
                {product.name}
              </p>
            </div>
          </div>
          <div className="col-span-1 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">
              {product.category}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {product.duration}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">{product.startDate}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-meta-3">${product.price}</p>
          </div>
          <div className="col-span-2 flex items-center">
            <p className="text-sm text-black dark:text-white">{product.customerEmail}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                  Edit
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white z-9999">
                <SheetHeader>
                  <SheetTitle>Edit Product</SheetTitle>
                  <SheetDescription>
                    Make changes to your product here. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                {editingProduct && (
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={editingProduct.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="text-sm font-medium">Model</label>
                      <Input
                        id="category"
                        name="category"
                        value={editingProduct.category}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={editingProduct.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="duration" className="text-sm font-medium">Duration</label>
                      <Input
                        id="duration"
                        name="duration"
                        type="text"
                        value={editingProduct.duration}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="price" className="text-sm font-medium">Price</label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={editingProduct.price}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="text-sm font-medium">Customer Email</label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={editingProduct.customerEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTwo;