"use client";

import botUseCase from "@/api/useCases/botUseCase";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Card } from "@/components/Card";
import { CancelIcon, CheckCircleIcon, ClockIcon } from "@/components/icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProcessData {
  document: {
    filename: string;
    createdAt: string;
    participants: Array<{
      _id: string;
      first_name: string;
      last_name: string;
      email: string;
      signatures: Array<unknown>;
      status: "pending" | "sent" | "signed" | "rejected";
      historySignatures: {
        signedAt: string | null;
        hasSigned: boolean;
        rejectedAt?: string | null;
      };
    }>;
  };
  signerId: string;
  pdfLink: string;
  activeUser: string;
}

export default function Page() {
  const t = useTranslations("ProcessPage");
  const tg = useTranslations("Global");
  const tb = useTranslations("Badge");

  const hasSentBotRef = useRef(false);

  const [data, setData] = useState<ProcessData | null>(null);

  useEffect(() => {
    try {
      const json = sessionStorage.getItem("processData");
      if (!json) return;
      setData(JSON.parse(json));
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("tokenData");
    // evita enviar más de una vez
    if (hasSentBotRef.current || !token) return;
    hasSentBotRef.current = true;
    const sendBot = async () => {
      try {
        const response = await botUseCase.sendSignedBot({ token: token || "" });
        if (response?.to && typeof response.to === "number") {
          window.location.href = `https://wa.me/+13156233678`;
        }
      } catch (e) {
        console.error("Error sending signed bot:", e);
      }
    };
    sendBot();
  }, []);

  if (!data) return null;

  const { document, pdfLink, activeUser } = data;

  // Totales para badges
  const totalParticipants = document.participants.length;
  const signedCount = document.participants.filter(
    (p) => p.status === "signed",
  ).length;
  const rejectedCount = document.participants.filter(
    (p) => p.status === "rejected",
  ).length;

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 pb-14">
      <div className="max-w-[1024px] mx-auto px-6 space-y-4 flex-1">
        <Card className="border-none shadow">
          <div className="flex flex-col md:flex-row md:items-center gap-x-6">
            <div className="shrink-0 p-6">
              <Image
                width={38}
                height={38}
                src="/filledIcons/check_circle.svg"
                alt=""
              />
            </div>

            <div className="space-y-4">
              <h2 className="font-bold text-neutral-700">
                {t("header.title")}
              </h2>
              <p className="font-bold text-neutral-700">
                {t("header.subtitle")}
                {activeUser}.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h4 className="text-adamo-sign-700 font-bold">
                {document.filename}
              </h4>
              <p className="text-neutral-700">
                Creado el{" "}
                {new Date(document.createdAt).toLocaleString("es-CO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>

            <div className="hidden md:flex gap-4">
              <Badge>
                {signedCount}/{totalParticipants} {tg("signatures")}
              </Badge>
              {rejectedCount > 0 ? (
                <Badge variant="error" type="negative">
                  <CancelIcon />
                  {tg("rejected")}
                </Badge>
              ) : signedCount === totalParticipants ? (
                <Badge variant="success" type="negative">
                  <CheckCircleIcon />
                  {tg("docSigned")}
                </Badge>
              ) : (
                <Badge variant="process" type="negative">
                  <ClockIcon />
                  {tg("inProcess")}
                </Badge>
              )}
            </div>
          </div>

          <Button
            className="mt-10"
            onClick={() => {
              if (pdfLink) window.open(pdfLink, "_blank");
            }}
          >
            {tg("viewDocument")}
          </Button>
        </Card>

        <Card>
          <h4 className="text-adamo-sign-700 font-bold">
            {tg("participantsOfDocument")}
          </h4>
          <div className="mt-4 space-y-4">
            {document.participants.map((p) => (
              <div key={p.email} className="bg-neutral-50 rounded-2xl p-4">
                <div className="flex items-center gap-8">
                  <div className="shrink-0 hidden md:block">
                    <Image
                      width={80}
                      height={80}
                      src="/participante-photo.png"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="flex gap-6 items-center md:items-start">
                      <div className="shrink-0 md:hidden">
                        <Image
                          width={72}
                          height={72}
                          src="/participante-photo.png"
                          alt=""
                        />
                      </div>
                      <div className="grid gap-y-2 gap-x-4 md:flex">
                        <h5 className="font-bold text-neutral-700">
                          {p.first_name} {p.last_name}
                        </h5>
                        <p className="truncate">{p.email}</p>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-4 flex items-center gap-4">
                      {p.status === "signed" ? (
                        <Badge type="negative" variant="success">
                          <CheckCircleIcon />
                          {tb("signed")}
                        </Badge>
                      ) : p.status === "rejected" ? (
                        <Badge type="negative" variant="error">
                          <CancelIcon />
                          {tb("rejected")}
                        </Badge>
                      ) : (
                        <Badge type="negative">
                          <ClockIcon />
                          {tb("process")}
                        </Badge>
                      )}

                      {(p.historySignatures.signedAt ||
                        p.historySignatures.rejectedAt) && (
                        <p className="hidden md:block text-xs">
                          {p.status === "signed"
                            ? new Date(
                                p.historySignatures.signedAt!,
                              ).toLocaleString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : p.status === "rejected" &&
                                p.historySignatures.rejectedAt
                              ? new Date(
                                  p.historySignatures.rejectedAt!,
                                ).toLocaleString("es-CO", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : null}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
