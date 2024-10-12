
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CarsTable from "@/components/Tables/carsTable";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car rental",
  description:
    "Car rental",
};

const FleetsPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Fleets" />

      <div className="flex flex-col gap-10 h-full">

        <CarsTable />

      </div>
    </DefaultLayout>
  );
};

export default FleetsPage;
