import Head from "next/head";
import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { Open_Sans } from "next/font/google";
// import { LangSwitcher } from "@/components/ui/LangSwitcher";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AuthProvider } from "@/context/AuthContext";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: ".: ADAMO SIGN :.",
  },
  description: ".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <Head>
        <title>.: ADAMO SIGN :.</title>
        <meta
          name="description"
          content=".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :."
        ></meta>
      </Head>
      <body className={openSans.className}>
        <AuthProvider>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              {children}

              <Toaster />
            </NextIntlClientProvider>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
