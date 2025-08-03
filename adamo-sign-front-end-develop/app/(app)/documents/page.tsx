import type { Metadata } from "next";

import { DocumentPage } from "@/components/Pages/DocumentPage";

export const metadata: Metadata = {
  title: {
    template: "%s | DOCUMENTS",
    default: ".: ADAMO SIGN :.",
  },
  description: ".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :.",
};

export default function Page() {
  return <DocumentPage />;
}
