import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Payment from "@/components/Payment-interface/payment";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments and Transactions",
  description: "Payments and Transactions",
};

const Payments = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Payments and Transactions" />

      <div className="flex flex-col gap-10 h-full">
        <Payment />
      </div>
    </DefaultLayout>
  );
};

export default Payments;
