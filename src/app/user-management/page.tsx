
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserManagement from "@/components/UserManagement/UserMangement";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car rental",
  description:
    "Car rental",
};

const UserManagementPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Manage users" />

      <div className="flex flex-col gap-10 h-full">
<UserManagement/>


      </div>
    </DefaultLayout>
  );
};

export default UserManagementPage;
