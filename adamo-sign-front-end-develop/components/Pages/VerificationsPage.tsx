"use client";
import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Card } from "../Card";
import { AppHeader } from "../ui/AppHeader";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";

const HASH = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

export const VerificationsPage = () => {
  const [query, setQuery] = useState<string>(HASH);
  const [response, setResponse] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations("VerificationsPage");

  const handleCheck = () => {
    setIsLoading(true);
    // Reset response to null to hide previous alerts/results while checking
    setResponse(null);

    // Simulate a 2-second delay before checking
    setTimeout(() => {
      if (query === HASH) {
        setResponse(true);
      } else {
        setResponse(false);
      }

      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <AppHeader heading={t("title")} />

      <Container>
        <p className="text-neutral-800">{t("description")}</p>

        <Card className="mt-8 shadow md:mt-10">
          <h2 className="text-neutral-700">{t("checkFormHeading")}</h2>

          <div className="mt-4 flex flex-col items-start gap-4 md:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("checkFormInputPlaceholder")}
            />
            <Button
              isLoading={isLoading}
              onClick={handleCheck}
              disabled={isLoading || !query}
            >
              {t("checkButton")}
            </Button>
          </div>
        </Card>

        {/* Show alerts only if a response has been determined (response !== null) */}
        {response !== null && (
          <div className="mt-6">
            {!response && (
              <Alert variant="danger">
                <p>{t("checkErrorNote")}</p>
              </Alert>
            )}

            {response && (
              <div className="space-y-6">
                <Alert>
                  <p>{t("checkSuccessNote")}</p>
                </Alert>

                <Card className="space-y-8">
                  <h3 className="font-bold text-adamo-sign-700">
                    {t("infoFormTitle")}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label={t("infoFormInputNameLabel")}
                      value="Juan Martín"
                      readOnly
                    />
                    <Input
                      label={t("infoFormInputLastNameLabel")}
                      value="Gonzalez"
                      readOnly
                    />
                    <Input
                      label={t("infoFormInputDocIdLabel")}
                      value="9.020.307.481"
                      readOnly
                    />
                    <Input
                      label={t("infoFormInputDocTypeLabel")}
                      value="Licencia de conducir"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="relative h-[243px] w-full overflow-hidden rounded-lg">
                      <Image
                        src="/verificationIcon-placeholder.png"
                        alt="Document Placeholder"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative h-[243px] w-full overflow-hidden rounded-lg">
                      <Image
                        src="/verificationIcon-placeholder.png"
                        alt="Document Placeholder"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};
