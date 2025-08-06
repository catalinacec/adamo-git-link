import type { Metadata } from "next";
import "./globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import { Open_Sans } from "next/font/google";

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
  const locale = "es"; // Default locale for now
  const messages = {}; // Default messages for now

  return (
    <html lang={locale}>
      <head>
        <title>.: ADAMO SIGN :.</title>
        <meta
          name="description"
          content=".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :."
        />
      </head>
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