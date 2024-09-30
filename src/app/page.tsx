
import Analytic from "@/components/Analytics/Analytics";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};


export default function Home() {
  return (
    <>
      <DefaultLayout>

        

   <Analytic/>
      </DefaultLayout>
    </>
  );
}
