'use client'

import { ResponsiveLine } from "@nivo/line";
import axios from "axios";
import { useEffect, useState } from "react";

interface LineChartProps {
  className?: string;
}
const API_BASE_URL = `${process.env.NEXT_PUBLIC_CONVEX_URL}/api`;

interface GrowthStats {
  date: string;
  count: number;
  revenue: number;
  cumulativeCount: number;
  cumulativeRevenue: number;
}

export function BookingsChart({ className, ...props }: LineChartProps) {
  const [growthStats, setGrowthStats] = useState<GrowthStats[]>([]);

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

  // Helper function to get day of week
  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Transform growth stats for the chart
  const chartData = growthStats.length > 0 ? [
    {
      id: "Total Bookings",
      data: growthStats.map(stat => ({
        x: getDayOfWeek(stat.date),
        y: stat.count  // Using daily count instead of cumulative
      }))
    },
    // {
    //   id: "Revenue",
    //   data: growthStats.map(stat => ({
    //     x: getDayOfWeek(stat.date),
    //     y: stat.count  // Using daily revenue instead of cumulative
    //   }))
    // }
  ] : [];

  return (
    <div className={className} {...props}>
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
          format: (value) => `${value}`
        }}
        colors={["#2563eb", "#16a34a"]}
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
        role="application"
        legends={[{
          anchor: 'right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          symbolSize: 12,
        }]}
      />
    </div>
  );
}






