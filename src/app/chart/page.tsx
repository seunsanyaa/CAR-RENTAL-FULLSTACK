import Chart from "@/components/Charts/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Chart | ",
  description:
    " Chart page  - ",
};

const BasicChartPage: React.FC = () => {
  return (
    <DefaultLayout>
      <Chart />
    </DefaultLayout>
  );
};

export default BasicChartPage;
