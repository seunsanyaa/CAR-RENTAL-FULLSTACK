
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableTwo from "@/components/Tables/TableTwo";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import TableOne from "@/components/Tables/TableOne";

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

        <TableOne />

      </div>
    </DefaultLayout>
  );
};

export default FleetsPage;
