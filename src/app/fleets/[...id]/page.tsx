
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import VehicleManagement from "@/components/Vehicle/VehicleManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car rental",
  description:
    "Car rental",
};

const FleetsPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Toyota Fleet" />

      <div className="flex flex-col gap-10 h-full">
<VehicleManagement/>


      </div>
    </DefaultLayout>
  );
};

export default FleetsPage;
