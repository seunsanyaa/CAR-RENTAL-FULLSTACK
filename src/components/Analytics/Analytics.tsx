'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";

interface LineChartProps {
  className?: string;
}

function LineChart({ className, ...props }: LineChartProps) {
  return (
    (<div className={className} {...props}>
      <ResponsiveLine
        data={[
          {
            id: "Desktop",
            data: [
              { x: "Jan", y: 43 },
              { x: "Feb", y: 137 },
              { x: "Mar", y: 61 },
              { x: "Apr", y: 145 },
              { x: "May", y: 26 },
              { x: "Jun", y: 154 },
            ],
          },
          {
            id: "Mobile",
            data: [
              { x: "Jan", y: 60 },
              { x: "Feb", y: 48 },
              { x: "Mar", y: 177 },
              { x: "Apr", y: 78 },
              { x: "May", y: 96 },
              { x: "Jun", y: 204 },
            ],
          },
        ]}
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
        }}
        colors={["#2563eb", "#e11d48"]}
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
    </div>)
  );
}

interface BarChartProps {
  className?: string;
}

function BarChart({ className, ...props }: BarChartProps) {
  return (
    (<div className={className} {...props}>
      <ResponsiveBar
        data={[
          { name: "Jan", count: 111 },
          { name: "Feb", count: 157 },
          { name: "Mar", count: 129 },
          { name: "Apr", count: 150 },
          { name: "May", count: 119 },
          { name: "Jun", count: 72 },
        ]}
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
        ariaLabel="A bar chart showing data" />
    </div>)
  );
}



const Analytic = () => {
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
                <LineChart className="aspect-[4/3]" />
                 </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart className="aspect-[4/3]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart className="aspect-[4/3]" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">2,345</div>
                <div className="text-muted-foreground">Total Registered Customers</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">125</div>
                <div className="text-muted-foreground">Total Cars</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">45</div>
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
