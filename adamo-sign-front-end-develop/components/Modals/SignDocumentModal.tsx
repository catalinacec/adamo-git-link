"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

import {
  CheckIcon,
  ChevronIcon,
  MatchCaseIcon,
  SignatureIcon,
  UploadIcon,
} from "../icon";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Progress } from "../ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Signature } from "@/types";

interface SignDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  typedSignature?: string
  activeUserOfQuery?: string
  signatures?: Array<Signature>
  activeSignature?: Signature | null
  setSignatures?: React.Dispatch<React.SetStateAction<Array<Signature>>>
  setIsEditingSignature?: React.Dispatch<React.SetStateAction<boolean>>
}

const fontUrls = {
  "FF Market": "https://db.onlinewebfonts.com/t/cbf4e1e19572ee20b952fd42eca5d2bf.ttf",
  "MadreScript": "https://db.onlinewebfonts.com/t/078dccb5f3be0956233a6975ccbf4975.ttf",
  "Dancing Script": "https://db.onlinewebfonts.com/t/be7d00cc3e81bca7bd01f0924f5d5b73.ttf",
  "Great Vibes": "https://db.onlinewebfonts.com/t/5bf06596a053153248631d74f9fc4e28.ttf",
  "Pacifico": "https://db.onlinewebfonts.com/t/6b6170fe52fb23f505b4e056fefd2679.ttf",
  "Satisfy": "https://db.onlinewebfonts.com/t/4b6d03ce5461faeda7d8e785d1a2351a.ttf"
};

if (typeof window !== "undefined") {

Object.entries(fontUrls).forEach(([fontName, fontUrl]) => {
  const fontFace = new FontFace(fontName, `url(${fontUrl})`);
  fontFace.load().then((loadedFont) => {
    document.fonts.add(loadedFont);
  }).catch((error) => {
    console.error(`Failed to load font ${fontName}:`, error);
  });
});
}

const COLORS = ["#111927", "#0BA5EC", "#15B79E", "#875BF7"];

export const SignDocumentModal = ({
  isOpen,
  onClose,
  activeSignature,
  activeUserOfQuery,
  setIsEditingSignature,
  setSignatures,
  signatures
}: SignDocumentModalProps) => {
  const [tab, setTab] = useState("main");
  const t = useTranslations("SignDocumentModal");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [signQuery, setSignQuery] = useState("");
  const [selectedFont, setSelectedFont] = useState("FF Market");
  const [selectedColor, setSelectedColor] = useState("#111927");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImageData, setSignatureImageData] = useState<string | null>(null); // For draw/upload

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const { offsetX, offsetY } = event.nativeEvent;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";

      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const { offsetX, offsetY } = event.nativeEvent;
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }
  };
  // Clear signature image data when switching tabs
  useEffect(() => {
    if (tab !== "draw") setSignatureImageData(null);
    if (tab !== "upload") setSignatureImageData(null);
  }, [tab]);

  const endDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setSignatureImageData(dataUrl);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    if (touch && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;

      const syntheticMouseEvent = {
        nativeEvent: { offsetX, offsetY },
      } as React.MouseEvent<HTMLCanvasElement>;

      startDrawing(syntheticMouseEvent);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    if (touch && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      const syntheticMouseEvent = {
        nativeEvent: { offsetX, offsetY },
      } as React.MouseEvent<HTMLCanvasElement>;

      draw(syntheticMouseEvent);
    }
  };

  const handleTouchEnd = () => endDrawing();

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid JPG or PNG file.");
        return;
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          setSelectedImage(reader.result as string);
          setSignatureImageData(reader.result as string); // Save for upload
          setIsLoading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setIsLoading(false);
    onClose();
    setTimeout(() => setTab("main"), 100);
  };

  const handleBack = () => {
    setTab("main");
    setSelectedImage(null);
    setIsLoading(false);
  };

  const handleSign = async () => {
    if (!activeSignature) {
      console.error("[Error] No active signature to save.");
      return;
    }

    let signatureType: "draw" | "upload" | "text" = "text";
    let signature: string | null = null;
    let signatureText: string | null = null;
    let signatureFontFamily: string | null = null;

    if (tab === "write") {
      if (!signQuery.trim()) {
        alert("Por favor escribe tu firma.");
        return;
      }
      signatureType = "text";
      signature = null;
      signatureText = signQuery;
      signatureFontFamily = selectedFont;
    } else if (tab === "draw") {
      if (!signatureImageData) {
        alert("Por favor dibuja tu firma.");
        return;
      }
      signatureType = "draw";
      signature = signatureImageData;
      signatureText = null;
      signatureFontFamily = null;
    } else if (tab === "upload") {
      if (!signatureImageData) {
        alert("Por favor sube una imagen de tu firma.");
        return;
      }
      signatureType = "upload";
      signature = signatureImageData;
      signatureText = null;
      signatureFontFamily = null;
    } else {
      alert("Tipo de firma no soportado.");
      return;
    }

    // Update sign in array
    const updatedSignatures = signatures?.map((sig) =>
      sig.id === activeSignature.id
        ? {
            ...sig,
            signatureType,
            signature,
            signatureText,
            signatureFontFamily,
            signatureIsEdit: true,
          }
        : sig
    );
    setSignatures?.(updatedSignatures as Signature[]);
    setIsEditingSignature?.(false);
    onClose();
    setTimeout(() => setTab("main"), 100);
  };

  useEffect(() => {
    if (activeUserOfQuery) {
      setSignQuery(activeUserOfQuery);
    }
  }, [activeUserOfQuery]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="z-in-[3500]">
        <DialogHeader>
          {tab === "main" && (
            <>
              <DialogTitle className="text-neutral-700">
                {t("title")}
              </DialogTitle>
              <DialogDescription>{t("subtitle")}</DialogDescription>
            </>
          )}

          {tab === "draw" && (
            <>
              <div className="flex items-center gap-x-2">
                <button type="button" onClick={handleBack}>
                  <ChevronIcon className="transform rotate-90" />
                </button>
                <DialogTitle className="text-neutral-700">
                  {t("tabDraw.title")}
                </DialogTitle>
              </div>
              <DialogDescription>{t("tabDraw.subtitle")}</DialogDescription>
            </>
          )}

          {tab === "write" && (
            <>
              <div className="flex items-center gap-x-2">
                <button type="button" onClick={handleBack}>
                  <ChevronIcon className="transform rotate-90" />
                </button>
                <DialogTitle className="text-neutral-700">
                  {t("tabWrite.title")}
                </DialogTitle>
              </div>
              <DialogDescription>{t("tabWrite.subtitle")}</DialogDescription>
            </>
          )}

          {tab === "upload" && (
            <>
              <div className="flex items-center gap-x-2">
                <button type="button" onClick={handleBack}>
                  <ChevronIcon className="transform rotate-90" />
                </button>
                <DialogTitle className="text-neutral-700">
                  {t("tabUpload.title")}
                </DialogTitle>
              </div>
              <DialogDescription>{t("tabUpload.subtitle")}</DialogDescription>
            </>
          )}
        </DialogHeader>

        <DialogBody>
          {tab === "main" && (
            <div className="grid gap-2 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setTab("draw")}
                className="flex items-center md:flex-col justify-center bg-adamo-sign-100 py-8 rounded-lg gap-2"
              >
                <SignatureIcon />
                <span className="text-xs text-neutral-600 font-semibold">
                  {t("tabDrawButton")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab("write")}
                className="flex items-center md:flex-col justify-center bg-adamo-sign-100 py-8 rounded-lg gap-2"
              >
                <MatchCaseIcon />
                <span className="text-xs text-neutral-600 font-semibold">
                  {t("tabWriteButton")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setTab("upload")}
                className="flex items-center md:flex-col justify-center bg-adamo-sign-100 py-8 rounded-lg gap-2"
              >
                <UploadIcon />
                <span className="text-xs text-neutral-600 font-semibold">
                  {t("tabUploadButton")}
                </span>
              </button>
            </div>
          )}

          {tab === "draw" && (
            <>
              <div className="flex flex-col items-center gap-4">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="border border-neutral-300 rounded-lg"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                {/* Mostrar previsualización de la firma dibujada */}
                {signatureImageData && (
                  <Image src={signatureImageData} alt="Drawn Signature" width={200} height={80} style={{ objectFit: "contain" }} />
                )}
              </div>
            </>
          )}

          {tab === "write" && (
            <>
              <div className="rounded-lg bg-neutral-50 min-h-[160px] p-2">
                <div className="flex justify-between">
                  <div>
                    <Select
                      value={selectedFont}
                      onValueChange={setSelectedFont}
                    >
                      <SelectTrigger className="text-neutral-400 text-sm font-semibold inline-flex">
                        {t("tabWrite.selectTrigger")}
                      </SelectTrigger>
                      <SelectContent
                        align="end"
                        sideOffset={16}
                        className="w-[224px]"
                      >
                        {Object.entries(fontUrls).map(([fontName]) => (
                          <SelectItem key={fontName} value={fontName}>
                            <span style={{ fontFamily: fontName }}>
                              {activeUserOfQuery}
                            </span>
                          </SelectItem>
                        ))}
 
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {COLORS.map((color) => (
                      <button
                        type="button"
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "rounded-full inline-flex items-center justify-center p-0.5",
                          color === selectedColor ? "w-5 h-5" : "w-4 h-4",
                        )}
                      >
                        {color === selectedColor && (
                          <CheckIcon className="text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-b border-neutral-200 mt-12">
                  <Input
                    value={signQuery}
                    onChange={(e) => setSignQuery(e.target.value)}
                    style={{
                      fontFamily: selectedFont,
                      fontWeight: 400,
                      color: selectedColor,
                    }}
                    className="mt-2 bg-transparent border-none focus:ring-0 focus:ring-offset-0 text-center text-xl font-semibold"
                  />
                </div>
              </div>
            </>
          )}

          {tab === "upload" && (
            <>
              <div className="rounded-lg bg-neutral-50 min-h-[160px] p-2 flex justify-center items-center flex-col gap-4 relative">
                {!selectedImage && !isLoading && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button size="medium" onClick={handleUpload}>
                      {t("tabUpload.uploadButton")}
                    </Button>
                    <p className="text-sm text-neutral-400">
                      {t("tabUpload.uploadRequirements")}
                    </p>
                  </>
                )}

                {isLoading && (
                  <>
                    <Progress className="max-w-[283px]" value={70} />
                    <p className="text-sm text-neutral-400">
                      {t("tabUpload.uploading")}
                    </p>
                  </>
                )}

                {selectedImage && !isLoading && (
                  <Image
                    src={selectedImage}
                    alt=""
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </>
          )}
        </DialogBody>

        {tab !== "main" && (
          <DialogFooter>
            <Button variant="secondary" onClick={handleCancel}>
              {t("cancelButton")}
            </Button>
            <Button onClick={handleSign}>{t("signButton")}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};