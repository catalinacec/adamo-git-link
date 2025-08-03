"use client";

// Import del use case: ajusta la ruta real según tu estructura
import DocumentUseCase from "@/api/useCases/DocumentUseCase";
import { StatDocItem } from "@/types";

import React from "react";
import { useDocumentsDashboard } from "@/hooks/useDocumentsDashboard";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";
import { useEffect } from "react";

import { CardGroup, MyFilesCard } from "@/components/Card";
import { CardStatDoc } from "@/components/Card/CardStatDoc";
import { UploadDocForm } from "@/components/Form/UploadDocForm";
import { PageSkeleton } from "@/components/PageSkeleton";
import { UploadDocument } from "@/components/UploadDocument";
import { ClockIcon, EditSquareIcon, TrashIcon } from "@/components/icon";
import { AppHeader } from "@/components/ui/AppHeader";
import { Container } from "@/components/ui/Container";

// Import dinámico de la tabla (ssr: false)
const TableContainer = dynamic(
  () => import("@/components/DocumentsTable").then((mod) => mod.TableContainer),
  { ssr: false },
);

export const DocumentPage: React.FC = () => {
  const t = useTranslations("AppDocuments");
  const tStats = useTranslations("AppDocuments.Stats");
  const { file } = useFile();
  const {
    tokenOfQuery,
    setTokenOfQuery,
    setDocumentName,
    setActiveUserOfQuery,
    setActiveRecipientEmail,
    setPdfLink,
    setSignatures,
  } = useSignatureData();


  const { documents, loading } = useDocumentsDashboard();

  useEffect(() => {
    const fetchParamsFromUrl = () => {
      const queryString = window.location.search;
      if (queryString) {
        const queryParams = new URLSearchParams(queryString);

        const token = queryParams.get("token");
        const activeEmail = queryParams.get("email");
        const activeUserName = queryParams.get("name");
        const documentName = queryParams.get("documentName");

        if (token) {
          setTokenOfQuery(token);
        }
        if (documentName) {
          setDocumentName(documentName);
        }
        if (activeUserName) {
          setActiveUserOfQuery(activeUserName);
        }
        if (activeEmail) {
          setActiveRecipientEmail(activeEmail);
        }

        if (token) {
          fetch(
            `${process.env.NEXT_PUBLIC_S3_BUCKETURL}/User+Data/${token}.json`,
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.emailPdfUrl) {
                setPdfLink(data.emailPdfUrl);
              }
              if (Array.isArray(data.signatures)) {
                setSignatures([...data.signatures]);
              }
            })
            .catch((error) => {
              console.error("Error in Fetching Data:", error);
            });
        }
      }
    };

    fetchParamsFromUrl();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) {
    return <PageSkeleton />;
  }

  const stats: StatDocItem[] = [
    {
      title: tStats("PendingDocuments.title", {
        count: documents?.pending ?? 0,
      }),
      description: tStats("PendingDocuments.description"),
      icon: <ClockIcon />,
      href: "/documents/pending",
      buttonText: tStats("PendingDocuments.buttonText"),
      buttonVariant: "primary",
    },
    {
      title: tStats("DraftDocuments.title", { count: documents?.draft ?? 0 }),
      description: tStats("DraftDocuments.description"),
      icon: <EditSquareIcon />,
      href: "/documents/drafts",
      buttonText: tStats("DraftDocuments.buttonText"),
      buttonVariant: "secondary",
    },
    {
      title: tStats("DeletedDocuments.title", { count: documents?.recycler ?? 0 }),
      description: tStats("DeletedDocuments.description"),
      icon: <TrashIcon />,
      href: "/documents/trash",
      buttonText: tStats("DeletedDocuments.buttonText"),
      buttonVariant: "secondary",
    },
  ];

  if (file || tokenOfQuery) {
    return <UploadDocForm />;
  }

  return (
    <div className="space-y-4">
      <AppHeader heading={t("title")} />

      <Container>
        <p className="text-neutral-800">{t("description")}</p>

        <div className="mt-8 space-y-6 md:mt-10">
          <UploadDocument />

          <CardGroup>
            {stats.map((stat) => (
              <CardStatDoc key={stat.title} {...stat} />
            ))}
          </CardGroup>

          <MyFilesCard />

          {/* Tabla con datos reales desde el backend */}
          <TableContainer
            fetchDocuments={({ page, limit, status }) =>
              DocumentUseCase.listDocuments({ page, limit, status })
            }
            // Pasa aquí otros props que tu TableContainer requiera
          />
        </div>
      </Container>
    </div>
  );
};
