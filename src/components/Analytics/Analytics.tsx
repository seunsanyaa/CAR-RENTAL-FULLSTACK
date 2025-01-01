'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import axios from "axios";
import { ChevronDown, ChevronUp, Download, Expand, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

type Period = 'week' | 'month' | 'quarter' | 'year';

interface MetricsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onExpand?: () => void;
}

function MetricsCard({ title, description, children, onExpand }: MetricsCardProps) {
  return (
    <Card className="col-span-1 h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {onExpand && (
          <Button variant="ghost" size="icon" onClick={onExpand}>
            <Expand className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="h-full flex flex-col">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function ExpandedMetricsDialog({ 
  title, 
  description, 
  children, 
  trigger 
}: { 
  title: string;
  description?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
            <TabsTrigger value="quarter">Quarterly</TabsTrigger>
            <TabsTrigger value="year">Yearly</TabsTrigger>
          </TabsList>
          {children}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface ExpandedChartProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode | ((period: Period) => JSX.Element);
  period?: Period;
  onPeriodChange?: (period: Period) => void;
}

const ExpandedChart = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  period = 'week',
  onPeriodChange
}: ExpandedChartProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end p-4">
      <div className="bg-white rounded-lg w-[calc(100%-280px)] max-w-5xl mr-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex items-center gap-4">
            <select 
              className="border rounded px-2 py-1"
              value={period}
              onChange={(e) => onPeriodChange?.(e.target.value as Period)}
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
              <option value="year">Yearly</option>
            </select>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="h-[500px]">
            {typeof children === 'function' ? children(period) : children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ChartDatum {
  x: string;
  y: number;
}

interface BarChartDatum {
  [key: string]: string | number;
}

const formatDateForPeriod = (dateStr: string, period: Period) => {
  const date = new Date(dateStr);
  switch (period) {
    case 'week':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'quarter':
      return date.toLocaleDateString('en-US', { month: 'short' });
    case 'year':
      return date.toLocaleDateString('en-US', { month: 'short' });
    default:
      return date.toLocaleDateString();
  }
};

const Analytics = () => {
  const [period, setPeriod] = useState<Period>('week');
  const [revenueMetrics, setRevenueMetrics] = useState<any>(null);
  const [customerMetrics, setCustomerMetrics] = useState<any>(null);
  const [bookingMetrics, setBookingMetrics] = useState<any>(null);
  const [carMetrics, setCarMetrics] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [popularCarsMetrics, setPopularCarsMetrics] = useState<any>(null);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  const fetchMetrics = async (newPeriod: Period = period) => {
    try {
      const [revenue, customers, bookings, cars, performance, popularCars] = await Promise.all([
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getRevenueSummary",
          args: { period: newPeriod }
        }),
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getCustomerMetrics",
          args: { period: newPeriod }
        }),
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getBookingMetrics",
          args: { period: newPeriod }
        }),
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getCarMetrics",
          args: { period: newPeriod }
        }),
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getPerformanceMetrics",
          args: { period: newPeriod }
        }),
        axios.post(`${API_BASE_URL}/query`, {
          path: "analytics:getPopularCars",
          args: { period: newPeriod }
        })
      ]);

      setRevenueMetrics(revenue.data.value);
      setCustomerMetrics(customers.data.value);
      setBookingMetrics(bookings.data.value);
      setCarMetrics(cars.data.value);
      setPerformanceMetrics(performance.data.value);
      setPopularCarsMetrics(popularCars.data.value);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const handleExportData = (data: any, filename: string) => {
    const ws = XLSX.utils.json_to_sheet([data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportAllData = () => {
    // Transform daily metrics into arrays for better Excel formatting
    const dailyMetrics = Object.entries(revenueMetrics?.dailyRevenue ?? {}).map(([date, revenue]) => {
      const bookings = bookingMetrics?.dailyBookings?.[date] ?? 0;
      const performance = performanceMetrics?.dailyMetrics?.[date] ?? { revenue: 0, bookings: 0 };
      
      return {
        Date: date,
        Revenue: revenue,
        Bookings: bookings,
        PerformanceRevenue: performance.revenue,
        PerformanceBookings: performance.bookings
      };
    });

    // Customer metrics sheet
    const customerSheet = [
      { Metric: 'Total Customers', Value: customerMetrics?.totalCustomers ?? 0 },
      { Metric: 'Active Customers', Value: customerMetrics?.activeCustomers ?? 0 },
      { Metric: 'Golden Members', Value: customerMetrics?.goldenMembers ?? 0 },
      { Metric: 'Customer Activity Rate', Value: `${customerMetrics?.customerActivityRate ?? 0}%` },
      { Metric: 'Golden Member Rate', Value: `${customerMetrics?.goldenMemberRate ?? 0}%` }
    ];

    // Booking locations sheet
    const locationSheet = Object.entries(bookingMetrics?.pickupLocations ?? {}).map(([location, count]) => ({
      Location: location,
      Bookings: count
    }));

    // Extras usage sheet
    const extrasSheet = Object.entries(bookingMetrics?.extrasUsage ?? {}).map(([extra, count]) => ({
      Extra: extra,
      Usage: count
    }));

    // Car metrics sheet
    const carSheet = [
      { Metric: 'Total Cars', Value: carMetrics?.totalCars ?? 0 },
      { Metric: 'Available Cars', Value: carMetrics?.availableCars ?? 0 },
      { Metric: 'Fleet Utilization Rate', Value: `${carMetrics?.fleetUtilizationRate ?? 0}%` }
    ];

    // Car categories sheet
    const categoriesSheet = Object.entries(carMetrics?.popularCategories ?? {}).map(([category, count]) => ({
      Category: category,
      Count: count
    }));

    // Car ratings sheet
    const ratingsSheet = Object.entries(carMetrics?.carRatings ?? {}).map(([model, rating]) => ({
      Model: model,
      Rating: rating
    }));

    // Popular cars sheet
    const popularCarsSheet = Object.entries(popularCarsMetrics?.carRentals ?? {}).map(([model, rentals]) => ({
      Model: model,
      Rentals: rentals
    }));

    // Category rentals sheet
    const categoryRentalsSheet = Object.entries(popularCarsMetrics?.categoryRentals ?? {}).map(([category, rentals]) => ({
      Category: category,
      Rentals: rentals
    }));

    // Performance metrics sheet
    const performanceSheet = [
      { Metric: 'Booking Success Rate', Value: `${performanceMetrics?.bookingSuccessRate ?? 0}%` },
      { Metric: 'Average Booking Value', Value: performanceMetrics?.averageBookingValue ?? 0 }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add all sheets
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dailyMetrics), 'Daily Metrics');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(customerSheet), 'Customer Metrics');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(locationSheet), 'Pickup Locations');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(extrasSheet), 'Extras Usage');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(carSheet), 'Car Metrics');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoriesSheet), 'Car Categories');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ratingsSheet), 'Car Ratings');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(popularCarsSheet), 'Popular Cars');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoryRentalsSheet), 'Category Rentals');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(performanceSheet), 'Performance Metrics');

    // Save the file
    XLSX.writeFile(wb, `car_rental_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Button 
          onClick={handleExportAllData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export All Analytics
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Revenue Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div onClick={() => setExpandedChart('revenue')} className="cursor-pointer">
            <MetricsCard
              title="Revenue Overview"
              description="Key revenue metrics"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  ${revenueMetrics?.totalRevenue?.toLocaleString() ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  {revenueMetrics?.totalBookings ?? 0} Total Bookings
                </div>
                <div className="text-sm text-gray-500">
                  ${revenueMetrics?.averageRevenuePerBooking?.toFixed(2) ?? 0} Avg. per Booking
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveLine
                    data={[
                      {
                        id: "revenue",
                        data: Object.entries(revenueMetrics?.dailyRevenue ?? {})
                          .map(([date, value]) => ({
                            x: formatDateForPeriod(date, period),
                            y: Number(value) || 0
                          }))
                          .reduce((acc, curr) => {
                            const existingPoint = acc.find(point => point.x === curr.x);
                            if (existingPoint) {
                              existingPoint.y += curr.y;
                            } else {
                              acc.push(curr);
                            }
                            return acc;
                          }, [] as ChartDatum[])
                          .sort((a, b) => {
                            const dateA = new Date(String(a.x));
                            const dateB = new Date(String(b.x));
                            return dateA.getTime() - dateB.getTime();
                          })
                      }
                    ]}
                    margin={{ top: 50, right: 60, bottom: 70, left: 70 }}
                    xScale={{ type: 'point' }}
                    yScale={{ 
                      type: 'linear',
                      min: 'auto',
                      max: 'auto',
                      stacked: false,
                      reverse: false
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 8,
                      tickPadding: 8,
                      tickRotation: period === 'week' ? -45 : -30,
                      legend: 'Date',
                      legendOffset: 60,
                      legendPosition: 'middle',
                      tickValues: period === 'year' ? 12 : period === 'quarter' ? 8 : undefined
                    }}
                    axisLeft={{
                      tickSize: 8,
                      tickPadding: 8,
                      tickRotation: 0,
                      legend: 'Revenue ($)',
                      legendOffset: -50,
                      legendPosition: 'middle',
                      format: (value) => 
                        typeof value === 'number' 
                          ? value >= 1000
                            ? `$${(value / 1000).toFixed(0)}k`
                            : `$${value}`
                          : value.toString()
                    }}
                    enableGridX={true}
                    enableGridY={true}
                    enablePoints={true}
                    pointSize={8}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor="#2563eb"
                    enableArea={true}
                    areaOpacity={0.15}
                    colors={["#2563eb"]}
                    useMesh={true}
                    theme={{
                      axis: {
                        domain: {
                          line: {
                            stroke: '#64748b',
                            strokeWidth: 1
                          }
                        },
                        ticks: {
                          line: {
                            stroke: '#64748b',
                            strokeWidth: 1
                          },
                          text: {
                            fill: '#64748b',
                            fontSize: 12
                          }
                        },
                        legend: {
                          text: {
                            fill: '#1e293b',
                            fontSize: 14,
                            fontWeight: 600
                          }
                        }
                      },
                      grid: {
                        line: {
                          stroke: '#e2e8f0',
                          strokeWidth: 1
                        }
                      },
                      crosshair: {
                        line: {
                          stroke: '#64748b',
                          strokeWidth: 1,
                          strokeOpacity: 0.35
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </MetricsCard>
          </div>

          <div onClick={() => setExpandedChart('customers')} className="cursor-pointer">
            <MetricsCard
              title="Customer Overview"
              description="Customer activity metrics"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  {customerMetrics?.totalCustomers ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  {customerMetrics?.activeCustomers ?? 0} Active Customers
                </div>
                <div className="text-sm text-gray-500">
                  {customerMetrics?.goldenMembers ?? 0} Golden Members
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsivePie
                    data={[
                      { id: 'Active', value: customerMetrics?.activeCustomers ?? 0 },
                      { id: 'Inactive', value: (customerMetrics?.totalCustomers ?? 0) - (customerMetrics?.activeCustomers ?? 0) }
                    ]}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={["#2563eb", "#e2e8f0"]}
                    enableArcLabels={false}
                    enableArcLinkLabels={false}
                  />
                </div>
              </div>
            </MetricsCard>
          </div>

          <div onClick={() => setExpandedChart('bookings')} className="cursor-pointer">
            <MetricsCard
              title="Booking Overview"
              description="Booking performance metrics"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  {bookingMetrics?.totalBookings ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  {bookingMetrics?.averageDuration?.toFixed(1) ?? 0} Days Avg. Duration
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveBar
                    data={Object.entries(bookingMetrics?.dailyBookings ?? {})
                      .map(([date, count]) => ({
                        date: formatDateForPeriod(date, period),
                        bookings: Number(count) || 0,
                        value: Number(count) || 0
                      }))
                      .reduce((acc, curr) => {
                        const existing = acc.find(item => item.date === curr.date);
                        if (existing) {
                          existing.bookings = (existing.bookings as number) + (curr.bookings as number);
                          existing.value = (existing.value as number) + (curr.value as number);
                        } else {
                          acc.push(curr);
                        }
                        return acc;
                      }, [] as BarChartDatum[])
                      .sort((a, b) => {
                        const dateA = new Date(String(a.date));
                        const dateB = new Date(String(b.date));
                        return dateA.getTime() - dateB.getTime();
                      })
                    }
                    keys={['bookings']}
                    indexBy="date"
                    margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
                    padding={0.3}
                    colors={["#2563eb"]}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: period === 'week' ? -45 : -30,
                      legend: 'Date',
                      legendOffset: 50,
                      tickValues: period === 'year' ? 12 : period === 'quarter' ? 8 : undefined
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Number of Bookings',
                      legendOffset: -50
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                  />
                </div>
              </div>
            </MetricsCard>
          </div>
        </section>

        {/* Performance Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div onClick={() => setExpandedChart('performance')} className="cursor-pointer">
            <MetricsCard
              title="Performance Overview"
              description="Key performance indicators"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  {performanceMetrics?.bookingSuccessRate?.toFixed(1) ?? 0}%
                </div>
                <div className="text-sm text-gray-500">
                  ${performanceMetrics?.averageBookingValue?.toFixed(2) ?? 0} Avg. Booking Value
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveLine
                    data={[
                      {
                        id: "revenue",
                        data: Object.entries(performanceMetrics?.dailyMetrics ?? {})
                          .map(([date, metrics]: [string, any]) => ({
                            x: formatDateForPeriod(date, period),
                            y: Number(metrics.revenue) || 0
                          }))
                          .reduce((acc, curr) => {
                            const existingPoint = acc.find(point => point.x === curr.x);
                            if (existingPoint) {
                              existingPoint.y = (existingPoint.y as number) + (curr.y as number);
                            } else {
                              acc.push(curr);
                            }
                            return acc;
                          }, [] as ChartDatum[])
                          .sort((a, b) => {
                            const dateA = new Date(String(a.x));
                            const dateB = new Date(String(b.x));
                            return dateA.getTime() - dateB.getTime();
                          })
                      },
                      {
                        id: "bookings",
                        data: Object.entries(performanceMetrics?.dailyMetrics ?? {})
                          .map(([date, metrics]: [string, any]) => {
                            // Scale up bookings to match revenue scale
                            const bookings = Number(metrics.bookings) || 0;
                            const scaledValue = bookings * (performanceMetrics?.averageBookingValue ?? 1000);
                            return {
                              x: formatDateForPeriod(date, period),
                              y: scaledValue
                            };
                          })
                          .reduce((acc, curr) => {
                            const existingPoint = acc.find(point => point.x === curr.x);
                            if (existingPoint) {
                              existingPoint.y = (existingPoint.y as number) + (curr.y as number);
                            } else {
                              acc.push(curr);
                            }
                            return acc;
                          }, [] as ChartDatum[])
                          .sort((a, b) => {
                            const dateA = new Date(String(a.x));
                            const dateB = new Date(String(b.x));
                            return dateA.getTime() - dateB.getTime();
                          })
                      }
                    ]}
                    margin={{ top: 40, right: 120, bottom: 60, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: period === 'week' ? -45 : -30,
                      legend: 'Date',
                      legendOffset: 50,
                      tickValues: period === 'year' ? 12 : period === 'quarter' ? 8 : undefined
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'Value',
                      legendOffset: -50
                    }}
                    enablePoints={true}
                    pointSize={8}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'color' }}
                    enableArea={true}
                    areaOpacity={0.15}
                    useMesh={true}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'square'
                      }
                    ]}
                  />
                </div>
              </div>
            </MetricsCard>
          </div>

          <div onClick={() => setExpandedChart('fleet')} className="cursor-pointer">
            <MetricsCard
              title="Fleet Overview"
              description="Fleet performance metrics"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  {carMetrics?.totalCars ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  {carMetrics?.fleetUtilizationRate?.toFixed(1) ?? 0}% Utilization Rate
                </div>
                <div className="text-sm text-gray-500">
                  {carMetrics?.availableCars ?? 0} Available Cars
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsivePie
                    data={[
                      { id: 'Available', value: carMetrics?.availableCars ?? 0 },
                      { id: 'In Use', value: (carMetrics?.totalCars ?? 0) - (carMetrics?.availableCars ?? 0) }
                    ]}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.6}
                    padAngle={0.7}
                    cornerRadius={3}
                    colors={["#2563eb", "#e2e8f0"]}
                    enableArcLabels={false}
                    enableArcLinkLabels={false}
                  />
                </div>
              </div>
            </MetricsCard>
          </div>

          <div onClick={() => setExpandedChart('popular-cars')} className="cursor-pointer">
            <MetricsCard
              title="Popular Cars"
              description="Most rented vehicles"
            >
              <div className="space-y-4 h-full flex flex-col">
                <div className="text-2xl font-bold">
                  {popularCarsMetrics?.totalRentals ?? 0}
                </div>
                <div className="text-sm text-gray-500">
                  Top Model: {popularCarsMetrics?.topModel ?? 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {popularCarsMetrics?.averageRating?.toFixed(1) ?? 0} Avg. Rating
                </div>
                <div className="flex-1 min-h-0">
                  <ResponsiveBar
                    data={Object.entries(popularCarsMetrics?.carRentals ?? {}).map(([model, rentals]) => ({
                      model: model.split(' ')[0], // Show only first word to save space
                      rentals: Number(rentals) || 0,
                      value: Number(rentals) || 0
                    })) as BarChartDatum[]}
                    keys={['rentals']}
                    indexBy="model"
                    margin={{ top: 20, right: 20, bottom: 30, left: 40 }}
                    padding={0.3}
                    colors={["#2563eb"]}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0
                    }}
                  />
                </div>
              </div>
            </MetricsCard>
          </div>
        </section>
      </div>

      {/* Expanded Charts */}
      <ExpandedChart
        isOpen={expandedChart === 'revenue'}
        onClose={() => setExpandedChart(null)}
        title="Revenue Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <ResponsiveLine
            data={[
              {
                id: "revenue",
                data: Object.entries(revenueMetrics?.dailyRevenue ?? {})
                  .map(([date, value]) => ({
                    x: formatDateForPeriod(date, currentPeriod),
                    y: Number(value) || 0
                  }))
                  .reduce((acc, curr) => {
                    const existingPoint = acc.find(point => point.x === curr.x);
                    if (existingPoint) {
                      existingPoint.y += curr.y;
                    } else {
                      acc.push(curr);
                    }
                    return acc;
                  }, [] as ChartDatum[])
                  .sort((a, b) => {
                    const dateA = new Date(String(a.x));
                    const dateB = new Date(String(b.x));
                    return dateA.getTime() - dateB.getTime();
                  })
              }
            ]}
            margin={{ top: 50, right: 60, bottom: 70, left: 70 }}
            xScale={{ type: 'point' }}
            yScale={{ 
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            curve="monotoneX"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 8,
              tickPadding: 8,
              tickRotation: currentPeriod === 'week' ? -45 : -30,
              legend: 'Date',
              legendOffset: 60,
              legendPosition: 'middle',
              tickValues: currentPeriod === 'year' ? 12 : currentPeriod === 'quarter' ? 8 : undefined
            }}
            axisLeft={{
              tickSize: 8,
              tickPadding: 8,
              tickRotation: 0,
              legend: 'Revenue ($)',
              legendOffset: -50,
              legendPosition: 'middle',
              format: (value) => 
                typeof value === 'number' 
                  ? value >= 1000
                    ? `$${(value / 1000).toFixed(0)}k`
                    : `$${value}`
                  : value.toString()
            }}
            enableGridX={true}
            enableGridY={true}
            enablePoints={true}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor="#2563eb"
            enableArea={true}
            areaOpacity={0.15}
            colors={["#2563eb"]}
            useMesh={true}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: '#64748b',
                    strokeWidth: 1
                  }
                },
                ticks: {
                  line: {
                    stroke: '#64748b',
                    strokeWidth: 1
                  },
                  text: {
                    fill: '#64748b',
                    fontSize: 12
                  }
                },
                legend: {
                  text: {
                    fill: '#1e293b',
                    fontSize: 14,
                    fontWeight: 600
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#e2e8f0',
                  strokeWidth: 1
                }
              },
              crosshair: {
                line: {
                  stroke: '#64748b',
                  strokeWidth: 1,
                  strokeOpacity: 0.35
                }
              }
            }}
          />
        )}
      </ExpandedChart>

      <ExpandedChart
        isOpen={expandedChart === 'customers'}
        onClose={() => setExpandedChart(null)}
        title="Customer Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <ResponsivePie
            data={[
              { id: 'Active', value: customerMetrics?.activeCustomers ?? 0, label: 'Active Customers' },
              { id: 'Inactive', value: (customerMetrics?.totalCustomers ?? 0) - (customerMetrics?.activeCustomers ?? 0), label: 'Inactive Customers' },
              { id: 'Golden', value: customerMetrics?.goldenMembers ?? 0, label: 'Golden Members' }
            ]}
            margin={{ top: 40, right: 120, bottom: 40, left: 120 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={["#2563eb", "#e2e8f0", "#fbbf24"]}
            enableArcLabels={true}
            arcLabelsTextColor="#ffffff"
            enableArcLinkLabels={true}
            arcLinkLabelsColor={{ from: 'color' }}
            legends={[
              {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 20,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle'
              }
            ]}
          />
        )}
      </ExpandedChart>

      <ExpandedChart
        isOpen={expandedChart === 'bookings'}
        onClose={() => setExpandedChart(null)}
        title="Booking Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <ResponsiveBar
            data={Object.entries(bookingMetrics?.dailyBookings ?? {})
              .map(([date, count]) => ({
                date: formatDateForPeriod(date, currentPeriod),
                bookings: Number(count) || 0,
                value: Number(count) || 0
              }))
              .reduce((acc, curr) => {
                const existing = acc.find(item => item.date === curr.date);
                if (existing) {
                  existing.bookings = (existing.bookings as number) + (curr.bookings as number);
                  existing.value = (existing.value as number) + (curr.value as number);
                } else {
                  acc.push(curr);
                }
                return acc;
              }, [] as BarChartDatum[])
              .sort((a, b) => {
                const dateA = new Date(String(a.date));
                const dateB = new Date(String(b.date));
                return dateA.getTime() - dateB.getTime();
              })
            }
            keys={['bookings']}
            indexBy="date"
            margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
            padding={0.3}
            colors={["#2563eb"]}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: currentPeriod === 'week' ? -45 : -30,
              legend: 'Date',
              legendOffset: 50,
              tickValues: currentPeriod === 'year' ? 12 : currentPeriod === 'quarter' ? 8 : undefined
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Number of Bookings',
              legendOffset: -50
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#ffffff"
          />
        )}
      </ExpandedChart>

      <ExpandedChart
        isOpen={expandedChart === 'performance'}
        onClose={() => setExpandedChart(null)}
        title="Performance Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <ResponsiveLine
            data={[
              {
                id: "revenue",
                data: Object.entries(performanceMetrics?.dailyMetrics ?? {})
                  .map(([date, metrics]: [string, any]) => ({
                    x: formatDateForPeriod(date, currentPeriod),
                    y: Number(metrics.revenue) || 0
                  }))
                  .reduce((acc, curr) => {
                    const existingPoint = acc.find(point => point.x === curr.x);
                    if (existingPoint) {
                      existingPoint.y = (existingPoint.y as number) + (curr.y as number);
                    } else {
                      acc.push(curr);
                    }
                    return acc;
                  }, [] as ChartDatum[])
                  .sort((a, b) => {
                    const dateA = new Date(String(a.x));
                    const dateB = new Date(String(b.x));
                    return dateA.getTime() - dateB.getTime();
                  })
              },
              {
                id: "bookings",
                data: Object.entries(performanceMetrics?.dailyMetrics ?? {})
                  .map(([date, metrics]: [string, any]) => {
                    // Scale up bookings to match revenue scale
                    const bookings = Number(metrics.bookings) || 0;
                    const scaledValue = bookings * (performanceMetrics?.averageBookingValue ?? 1000);
                    return {
                      x: formatDateForPeriod(date, currentPeriod),
                      y: scaledValue
                    };
                  })
                  .reduce((acc, curr) => {
                    const existingPoint = acc.find(point => point.x === curr.x);
                    if (existingPoint) {
                      existingPoint.y = (existingPoint.y as number) + (curr.y as number);
                    } else {
                      acc.push(curr);
                    }
                    return acc;
                  }, [] as ChartDatum[])
                  .sort((a, b) => {
                    const dateA = new Date(String(a.x));
                    const dateB = new Date(String(b.x));
                    return dateA.getTime() - dateB.getTime();
                  })
              }
            ]}
            margin={{ top: 40, right: 120, bottom: 60, left: 60 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 'auto',
              max: 'auto',
              stacked: false,
              reverse: false
            }}
            yFormat={value => {
              if (typeof value === 'number') {
                return value >= 1000
                  ? `$${(value / 1000).toFixed(1)}k`
                  : `$${value}`;
              }
              return value.toString();
            }}
            axisTop={null}
            axisRight={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Number of Bookings',
              legendOffset: 70,
              format: value => Math.round(Number(value))
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: currentPeriod === 'week' ? -45 : -30,
              legend: 'Date',
              legendOffset: 50,
              tickValues: currentPeriod === 'year' ? 12 : currentPeriod === 'quarter' ? 8 : undefined
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Revenue ($)',
              legendOffset: -50,
              format: value => 
                typeof value === 'number' 
                  ? value >= 1000
                    ? `$${(value / 1000).toFixed(0)}k`
                    : `$${value}`
                  : value.toString()
            }}
            enablePoints={true}
            pointSize={8}
            pointColor={{ theme: 'background' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'serieColor' }}
            enableGridX={true}
            enableGridY={true}
            colors={["#2563eb", "#f97316"]}
            useMesh={true}
            legends={[
              {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 20,
                itemTextColor: '#64748b',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#1e293b'
                    }
                  }
                ]
              }
            ]}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: '#64748b',
                    strokeWidth: 1
                  }
                },
                ticks: {
                  line: {
                    stroke: '#64748b',
                    strokeWidth: 1
                  },
                  text: {
                    fill: '#64748b',
                    fontSize: 12
                  }
                },
                legend: {
                  text: {
                    fill: '#1e293b',
                    fontSize: 14,
                    fontWeight: 600
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#e2e8f0',
                  strokeWidth: 1
                }
              },
              crosshair: {
                line: {
                  stroke: '#64748b',
                  strokeWidth: 1,
                  strokeOpacity: 0.35
                }
              }
            }}
          />
        )}
      </ExpandedChart>

      <ExpandedChart
        isOpen={expandedChart === 'fleet'}
        onClose={() => setExpandedChart(null)}
        title="Fleet Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <div className="grid grid-cols-2 gap-8 h-full">
            <ResponsivePie
              data={[
                { id: 'Available', value: carMetrics?.availableCars ?? 0, label: 'Available Cars' },
                { id: 'In Use', value: (carMetrics?.totalCars ?? 0) - (carMetrics?.availableCars ?? 0), label: 'Cars in Use' }
              ]}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={["#2563eb", "#e2e8f0"]}
              enableArcLabels={true}
              arcLabelsTextColor="#ffffff"
              enableArcLinkLabels={true}
              arcLinkLabelsColor={{ from: 'color' }}
            />
            <ResponsiveBar
              data={Object.entries(carMetrics?.popularCategories ?? {}).map(([category, count]) => ({
                category,
                count: Number(count) || 0,
                value: Number(count) || 0
              })) as BarChartDatum[]}
              keys={['count']}
              indexBy="category"
              margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
              padding={0.3}
              colors={["#2563eb"]}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Category',
                legendOffset: 50
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Cars',
                legendOffset: -50
              }}
            />
          </div>
        )}
      </ExpandedChart>

      <ExpandedChart
        isOpen={expandedChart === 'popular-cars'}
        onClose={() => setExpandedChart(null)}
        title="Popular Cars Analytics"
        period={period}
        onPeriodChange={setPeriod}
      >
        {(currentPeriod: Period): JSX.Element => (
          <div className="grid grid-cols-2 gap-8 h-full">
            <ResponsiveBar
              data={Object.entries(popularCarsMetrics?.carRentals ?? {}).map(([model, rentals]) => ({
                model,
                rentals: Number(rentals) || 0,
                value: Number(rentals) || 0
              })) as BarChartDatum[]}
              keys={['rentals']}
              indexBy="model"
              margin={{ top: 40, right: 40, bottom: 60, left: 60 }}
              padding={0.3}
              colors={["#2563eb"]}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Car Model',
                legendOffset: 50
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Rentals',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor="#ffffff"
            />
            <ResponsivePie
              data={Object.entries(popularCarsMetrics?.categoryRentals ?? {}).map(([category, rentals]) => ({
                id: category,
                label: category,
                value: Number(rentals) || 0
              }))}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              colors={{ scheme: 'paired' }}
              enableArcLabels={true}
              arcLabelsTextColor="#ffffff"
              enableArcLinkLabels={true}
              arcLinkLabelsColor={{ from: 'color' }}
            />
          </div>
        )}
      </ExpandedChart>
    </div>
  );
};

export default Analytics;
