import type { Metadata } from "next";

import SignPageContainer from "./SignPageContainer";

export const metadata: Metadata = {
  title: "Document",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  console.log(id);

  return <SignPageContainer />;
}
