import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomersTable from "@/components/Tables/customersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
title: "Customer Management",
  description: "Customer management for car rental"
};

const CustomersPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customer Management" />

      <div className="flex flex-col gap-10 h-full">
        <CustomersTable />
      </div>
    </DefaultLayout>
  );
};

export default CustomersPage;
