import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import PromotionsManagement from "@/components/Promotions/PromotionsManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions",
  description: "Promotions management",
};

const PromotionsPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Promotions" />

      <div className="flex flex-col gap-10 h-full">
        <PromotionsManagement />
      </div>
    </DefaultLayout>
  );
};

export default PromotionsPage; 