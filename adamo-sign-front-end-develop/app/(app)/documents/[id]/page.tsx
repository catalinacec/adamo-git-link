import type { Metadata } from "next";

import { DocumentContainer } from "./DocumentContainer";

export const metadata: Metadata = {
  title: {
    template: "%s | DOCUMENTS",
    default: ".: ADAMO SIGN :.",
  },
  description: ".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  return <DocumentContainer id={id} />;
}
