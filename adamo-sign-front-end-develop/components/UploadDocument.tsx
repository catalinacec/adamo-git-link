"use client";

import { useCallback, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/Button";

import { Progress } from "./ui/progress";

export const UploadDocument = () => {
  const t = useTranslations("AppDocuments");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const { file, setFile, setFileName } = useFile();
  const { resetContext } = useSignatureData();

  // Limpia todo el flujo de carga de documento
  const handleNewDocument = useCallback(() => {
    setFile(null);
    setFileName("");
    resetContext();
  }, [setFile, setFileName, resetContext]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const uploadedFile = event.target.files?.[0];
    // Siempre limpiar antes de procesar, incluso si es el mismo archivo
    handleNewDocument();
    await processFile(uploadedFile);
    // Reiniciar el input para permitir subir el mismo archivo dos veces seguidas
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (uploadedFile?: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/png",
    ];

    if (uploadedFile) {
      if (allowedTypes.includes(uploadedFile.type)) {
        setErrorMessage("");
        setIsUploading(false);

        if (
          uploadedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          await handleConvertFile(uploadedFile, "docx", "pdf");
        } else if (
          uploadedFile.type ===
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ) {
          await handleConvertFile(uploadedFile, "pptx", "pdf");
        } else {
          setFile(uploadedFile);
        }
      } else {
        setFile(null);
        setErrorMessage(t("NewDocument.unsupporedFile"));
      }
    }
  };

  const handleConvertFile = async (
    uploadedFile: File,
    type: string,
    targetFormat: string,
  ) => {
    if (!uploadedFile) {
      setErrorMessage(t("NewDocument.validFile"));
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("File", uploadedFile);
      formData.append("StoreFile", "true");
      console.log(
        "process.env.NEXT_PUBLIC_CONVERTAPI_JWT",
        process.env.NEXT_PUBLIC_CONVERTAPI_JWT,
      );

      const response = await fetch(
        `https://v2.convertapi.com/convert/${type}/to/${targetFormat}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CONVERTAPI_SECRET}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.Files && result.Files.length > 0) {
        const convertedFileUrl = result.Files[0].Url;
        const convertedFileName = result.Files[0].FileName;
        setFileName(convertedFileName);
        setFile(convertedFileUrl);
      } else {
        setErrorMessage(t("NewDocument.conversionFailed"));
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(`Conversion failed: ${err.message}`);
      } else {
        setErrorMessage(t("NewDocument.conversionUnknown"));
      }

      console.error("Error during conversion:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const uploadedFile = event.dataTransfer.files?.[0];
    // Siempre limpiar antes de procesar, incluso si es el mismo archivo
    handleNewDocument();
    await processFile(uploadedFile);
  };

  return (
    <div
      className={cn(
        "rounded-3xl bg-white p-6 shadow",
        isDragActive && "border border-dashed border-blue-500",
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="rounded-2xl border border-dashed border-neutral-400 px-8 py-10">
        <h2
          className={cn(
            "text-lg font-bold",
            isUploading ? "text-neutral-400" : "text-adamo-sign-700",
          )}
        >
          {t("NewDocument.title")}
        </h2>
        <p
          className={cn(
            "mt-4",
            isUploading ? "text-neutral-400" : "text-neutral-700",
          )}
        >
          {t("NewDocument.description")}
        </p>

        <div className="mt-10 flex flex-col items-start gap-8 md:flex-row md:items-center">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Upload document"
          />

          {!isUploading && !file ? (
            <>
              <Button className="w-full xs:w-min" onClick={handleButtonClick}>
                <span className="truncate">{t("NewDocument.buttonText")}</span>
              </Button>
              <p
                className={errorMessage ? "text-error-500" : "text-neutral-400"}
              >
                {errorMessage || t("NewDocument.fileSizeNote")}
              </p>
            </>
          ) : (
            <>
              <Progress className="max-w-[283px]" value={70} />
              <p className="text-neutral-400">
                {t("NewDocument.uploadingDocument")}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
