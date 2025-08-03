"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";

import { StatItem } from "@/types";

import { useTranslations } from "next-intl";

import { CardGroup, CardStat } from "@/components/Card";
import { ChevronIcon, KidStarIcon } from "@/components/icon";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

import DashboardUseCase from "@/api/useCases/DashboardUseCase";
import { DashboardResponse } from "@/api/types/DashboardTypes";

/* 
Moved to app/metadata.ts to improve performance
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: ".: ADAMO SIGN :.",
  },
  description: ".: SOLUCIÓN DE FIRMADO ELECTRÓNICO DE ÚLTIMA TECNOLOGÍA :.",
}; */

export default function Page() {
  const t = useTranslations("AppHome");
  const tStats = useTranslations("AppHome.Stats");
  const router = useRouter();
  
  const [ loadingIdx, setLoadingIdx ] = useState<number | null>(null);
  const [ dashboard, setDashboard ] = useState<DashboardResponse | null>(null);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await DashboardUseCase.getDashboardInfo();
        const data = response.data;

        setDashboard(data);
      } catch (error) {
        console.log("error fetching data: ", error);
        setDashboard(null);
      }
    };
    fetchDashboard();
  }, []);

  const handleViewDocuments = (status: string, idx: number) => {
    setLoadingIdx(idx);
    router.push(`/documents/list?page=1&limit=50&filter[status]=${status}`);
  };

  const stats: StatItem[] = [
    {
      icon: "/filledIcons/check_circle.svg",
      title: tStats("completedDocuments.title"),
      value: typeof dashboard?.documents?.completed === "number"
          ? dashboard.documents.completed.toLocaleString()
          : "-",
      href: "/documents?page=1&limit=50&filter[status]=completed",
      hrefText: tStats("completedDocuments.buttonText"),
    },
    {
      icon: "/filledIcons/cancel.svg",
      title: tStats("rejectedDocuments.title"),
      value: typeof dashboard?.documents?.rejected === "number"
          ? dashboard.documents.rejected.toLocaleString()
          : "-",
      href: "/documents?page=1&limit=50&filter[status]=rejected",
      hrefText: tStats("rejectedDocuments.buttonText"),
    },
    {
      icon: "/filledIcons/alarm.svg",
      title: tStats("inProcessDocuments.title"),
      value: typeof dashboard?.documents?.["in_progress"] === "number"
        ? dashboard.documents["in_progress"].toLocaleString()
        : "-",
      href: "/documents?page=1&limit=50&filter[status]=draft",
      hrefText: tStats("inProcessDocuments.buttonText"),
    },
  ];

  const completedDocuments = dashboard?.documents?.completed || 0
  const rejectedDocuments = dashboard?.documents?.rejected || 0
  const inProcessDocuments = dashboard?.documents?.["in_progress"] || 0
  const totalDocumentsCount = completedDocuments + rejectedDocuments + inProcessDocuments

  const welcomeMessage = dashboard?.welcomeMessage ?? '';
  const parts = welcomeMessage.split(', ');
  const name = parts[1]?.replace('!', '') ?? '';
  // Split names
  const nameParts = name.split(' ');
  // Clean undefined name or surname
  const cleanMessage = nameParts.filter(p => p && p !== 'undefined' && p !== 'null').join(' ');

  return (
    <div className="space-y-4">
      <AppHeader heading={t("title")} />

      {/* Main Container */}
      <Container className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
          <div className="rounded-3xl bg-white px-8 py-6 shadow lg:col-span-9 lg:pb-9 lg:pt-10">
            <h2 className="mb-4 hidden text-lg font-bold text-neutral-700 md:block">  
              {t("welcome.greeting", { name: cleanMessage || " " })}
            </h2>
            <p className="text-neutral-700">{t("welcome.description")}</p>
          </div>

          <div className="flex items-center gap-6 lg:col-span-3 lg:flex-col lg:items-start">
            <div className="inline-flex shrink-0 items-center gap-3 rounded-full border border-adamo-sign-100 bg-white px-6 py-3 text-sm">
              <span>{dashboard?.plan || "View Plans"}</span>
              <KidStarIcon className="shrink-0" />
            </div>

            <div className="flex items-center gap-5 rounded-2xl bg-adamo-sign-100 p-2 text-sm md:p-4">
              <Button size="medium">
                <ChevronIcon className="-rotate-90" />
              </Button>
              <p>
                <span className="sm:hidden">{t("plan.upgradeTextMobile")}</span>
                <span className="hidden sm:inline">
                  {t("plan.upgradeText")}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Document Statistics Section */}
        <div className="flex flex-col gap-x-6 gap-y-8 rounded-3xl border border-neutral-200 bg-white px-8 py-10 md:grid md:grid-cols-12 md:items-center">
          <div className="space-y-4 md:col-span-6 lg:col-span-7">
            <h3 className="text-lg font-bold text-neutral-700">
              {t("documents.count", { count: totalDocumentsCount })}
            </h3>
            <p className="text-neutral-700">{t("documents.description")}</p>
          </div>

          <div className="flex flex-col items-start gap-6 xs:flex-row md:col-span-6 md:gap-14 lg:col-span-5 lg:justify-end">
              <Link href="/documents/list">
                <Button>
                  {t("documents.viewButton")}
                </Button>
              </Link>
              <Link href={"/documents"}>
                <Button variant="link">{t("documents.newButton")}</Button>
              </Link>
          </div>
        </div>

        {/* Card Group for Stats */}
        {/* <CardGroup>
          {stats.map((stat) => (
            <CardStat key={stat.title} {...stat} />
          ))}
        </CardGroup> */}
        <CardGroup>
        {stats.map((stat, idx) => (
          <CardStat
            key={stat.title}
            {...stat}
            href={undefined}
            hrefText={
              <Button
                onClick={() => handleViewDocuments(
                  idx === 0 ? "completed" : idx === 1 ? "rejected" : "inProgress",
                  idx
                )}
                disabled={loadingIdx === idx}
                isLoading={loadingIdx === idx}
              >
                {stat.hrefText}
              </Button>
            }
          />
        ))}
      </CardGroup>
      </Container>
    </div>
  );
}
