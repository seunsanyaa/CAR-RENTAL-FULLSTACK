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
        path: "bookings:getBookingGrowthStats",
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

  // Transform growth stats for the chart
  const chartData = growthStats.length > 0 ? [
    // {
    //   id: "Total Bookings",
    //   data: growthStats.map(stat => ({
    //     x: stat.date,
    //     y: stat.cumulativeCount
    //   }))
    // },
    {
      id: "Revenue",
      data: growthStats.map(stat => ({
        x: stat.date,
        y: stat.cumulativeRevenue
      }))
    }
  ] : [];

  return (
    <div className={`w-full ${className}`} {...props}>
      <ResponsiveLine
        data={chartData}
        margin={{ top: 30, right: 30, bottom: 50, left: 70 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          precision: "day"
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: 0,
          max: "auto"
        }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 12,
          format: "%b %d",
          tickRotation: -45,
          legend: "Date",
          legendOffset: 40,
          legendPosition: "middle"
        }}
        axisLeft={{
          tickSize: 5,
          tickValues: 5,
          tickPadding: 12,
          format: value => `$${value}`,
          legend: "Revenue",
          legendOffset: -50,
          legendPosition: "middle"
        }}
        enableGridX={false}
        gridYValues={5}
        pointSize={8}
        pointColor="#ffffff"
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        enablePointLabel={true}
        pointLabel="y"
        curve="monotoneX"
        enableArea={true}
        areaOpacity={0.1}
        colors={["#3b82f6"]}
        lineWidth={3}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "13px",
              textTransform: "capitalize",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px",
            },
          },
          grid: {
            line: {
              stroke: "#e5e7eb",
              strokeWidth: 1,
            },
          },
          axis: {
            legend: {
              text: {
                fontSize: 12,
                fontWeight: 600,
                fill: "#6b7280",
              },
            },
          },
        }}
        role="application"
        // legends={[{
        //   anchor: "right",
        //   direction: "column",
        //   justify: false,
        //   translateX: 100,
        //   translateY: 0,
        //   itemsSpacing: 2,
        //   itemWidth: 100,
        //   itemHeight: 20,
        // }]}
      />
    </div>
  );
}






