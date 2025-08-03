import type { Metadata } from "next";
import { ResetPage } from "@/components/Pages/Auth/ResetPage";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function Page() {
  return <ResetPage />;
}
