
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableTwo from "@/components/Tables/TableTwo";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car rental",
  description:
    "Car rental",
};

const TablesPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Bookings" />

      <div className="flex flex-col gap-10 h-full">

        <TableTwo />

      </div>
    </DefaultLayout>
  );
};

export default TablesPage;
