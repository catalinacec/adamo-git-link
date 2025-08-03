import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";

import { cn } from "@/lib/utils";

import { AppHeader } from "@/components/ui/AppHeader";
// import { LangSwitcher } from '@/components/ui/LangSwitcher';

import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const papyrus = localFont({
  src: "../fonts/papyrus.ttf",
  display: "swap",
});

export const metadata: Metadata = {
  title: ".: ADAMO SIGN :.",
  description: "",
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
      <body className={cn(openSans.className, papyrus.style)}>
        <NextIntlClientProvider messages={messages}>
          <AppHeader />
          {children}

          {/* <div className="fixed bottom-6 right-6">
                <LangSwitcher />
              </div> */}

          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
