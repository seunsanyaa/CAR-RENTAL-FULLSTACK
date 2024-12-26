'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';

interface LineChartProps {
  className?: string;
}
const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;


function PaymentsChart({ className, ...props }: LineChartProps) {
const [dailyVisitors, setDailyVisitors] = useState([]);


  const fetchDailyVisitors = async () => {
   
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "payment:getDailyPaymentStats",
        args: {}
      });
      console.log(response);
      if (response.data) {

        setDailyVisitors(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } 
  };

  useEffect(() => {
    fetchDailyVisitors();
  }, []);

  console.log(dailyVisitors,'weeekly');

  // Transform dailyVisitors data for the chart
  const chartData = [
    {
      id: "daily-payment-counts",
      data: dailyVisitors.map((item: any) => ({
        x: new Date(item.x).toLocaleDateString('en-US', { weekday: 'short' }),
        y: item.y
      }))
    }
  ];

  const handleDownload = () => {
    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(dailyVisitors.map((item: any) => ({
      Date: new Date(item.x).toLocaleDateString('en-US'),
      Amount: item.y
    })));
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Stats");
    
    // Generate and download the file
    XLSX.writeFile(wb, "payment-statistics.xlsx");
  };

  return (
    <div className={className} {...props}>
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          className="h-8 w-8"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
          format: (value) => `$${value}`
        }}
        colors={["#2563eb"]}
        pointSize={6}
        useMesh={true}
        gridYValues={6}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        role="application" />
    </div>
  );
}

interface BarChartProps {
  className?: string;
}

function BarChart({ className, ...props }: BarChartProps) {
  const [growthStats, setGrowthStats] = useState([]);

  const fetchBookingStats = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getDailyBookingStats",
        args: {}
      });

      if (response.data?.value) {
        setGrowthStats(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching booking stats:', err);
    }
  };

  useEffect(() => {
    fetchBookingStats();
  }, []);
  // Transform the data for the chart
  const chartData = growthStats.map((item: any) => ({
    // name: new Date(item.x).toLocaleDateString('en-US', { weekday: 'short' }),
    name:item.x,
    count: item.y
  }));

  const handleDownload = () => {
    // Create worksheet from the data
    const ws = XLSX.utils.json_to_sheet(growthStats.map((item: any) => ({
      Date: item.x,
      Bookings: item.y
    })));
    
    // Create workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Booking Stats");
    
    // Generate and download the file
    XLSX.writeFile(wb, "booking-statistics.xlsx");
  };

  return (
    <div className={className} {...props}>
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          className="h-8 w-8"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <ResponsiveBar
        data={chartData}
        keys={["count"]}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={["#2563eb"]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        gridYValues={4}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
        ariaLabel="A bar chart showing booking data" />
    </div>
  );
}



const Analytic = () => {
  const [carsCount, setCarsCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [activeBookingCount, setActiveBookingCount] = useState(0);

  const fetchCarsCount = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "car:getNumberOfCars",
        args: {}
      });
      
      if (response.data) {
        setCarsCount(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching cars count:', err);
    }
  };

  const fetchCustomerCount = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "customers:getCustomerCount",
        args: {}
      });
      
      if (response.data) {
        setCustomerCount(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching customer count:', err);
    }
  };


  const fetchActiveBookingCount= async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "bookings:getActiveBookingsCount",
        args: {}
      });
      
      if (response.data) {
        setActiveBookingCount(response.data.value.total);
      }
    } catch (err) {
      console.error('Error fetching active booking count:', err);
    }
  };
  const fetchStaffCount = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        path: "staff:getStaffCount",
        args: {}
      });
      
      if (response.data) {
        setStaffCount(response.data.value);
      }
    } catch (err) {
      console.error('Error fetching staff count:', err);
    }
  };

  useEffect(() => {
    fetchCarsCount();
    fetchCustomerCount();
    fetchStaffCount();
    fetchActiveBookingCount();
  }, []);

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>View key metrics and insights for your business.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Profits</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentsChart className="aspect-[4/3]" />
                 </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart className="aspect-[4/3]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                {/* <CardTitle>Active Bookings</CardTitle> */}
              </CardHeader>
              <CardContent className="flex h-full flex-col items-center justify-center">
                <div className="text-4xl font-bold">{activeBookingCount}</div>
                <div className="text-muted-foreground">Currently Active Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{customerCount}</div>
                <div className="text-muted-foreground">Total Registered Customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{carsCount}</div>
                <div className="text-muted-foreground">Total Cars</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{staffCount}</div>
                <div className="text-muted-foreground">Total Employees</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
  );
};

export default Analytic;
