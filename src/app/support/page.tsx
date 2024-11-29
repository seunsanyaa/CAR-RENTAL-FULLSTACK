import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CustomerSupport from "@/components/customersupport/customer_support";
import { Metadata } from "next";

export const metadata: Metadata = {
title: "Customer Support",
  description: "Customer Support for car rental"
};

const SupportPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Customer Support" />

      <div className="flex flex-col gap-10 h-full">
        <CustomerSupport />
      </div>
    </DefaultLayout>
  );
};

export default SupportPage;
