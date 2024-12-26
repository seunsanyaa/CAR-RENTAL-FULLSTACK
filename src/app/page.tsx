
import Analytic from "@/components/Analytics/Analytics";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Next.js  | ",
  description: " Home for ",
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
