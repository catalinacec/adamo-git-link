"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ClipLoader } from "react-spinners";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { PdfViewer } from "@/components/PdfViewer";
import { useSidebar } from "@/components/Sidebar/Sidebar";
import SignItem from "@/components/SignItem";
import DocMenu from "@/components/ui/DocMenu";

export const Step2 = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfReady, setPdfReady] = useState(false);
  const { getValues } = useFormContext();

  const { file } = useFile();

  const {
    setCurrentSlideIndex,
    currentSlideIndex,
    queryPdfUrl,
    signatures,
    activeRecipientEmail,
    setPdfLoad,
    setViewerRef,
    setPdfLink,
    pdfLink,
    loading,
    setSignatures,
  } = useSignatureData();

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const participants = getValues("participants");

  const { setOpen } = useSidebar();

  useEffect(() => {
    if (viewerRef.current) {
      setViewerRef(viewerRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerRef, setViewerRef]);

  useEffect(() => {
    if (typeof file === "string" && file.startsWith("http")) {
      setPdfLink(file);
      setSelectedFile(null);
    } else if (file instanceof File) {
      setSelectedFile(file);
      setPdfLink(null);
    }
  }, [file, setPdfLink]);

  useEffect(() => {
    if (viewerRef.current) {
      setViewerRef(viewerRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
  }, [setOpen]);

  // Detecta cuando el PDF está listo
  useEffect(() => {
    if (!viewerRef.current) return;
    const checkSlides = () => {
      console.log("Checking slides...");
      const slides = viewerRef.current
        ? viewerRef.current.querySelectorAll(".pdf-slide, .image-slide")
        : [];
      console.log(`Found ${slides.length} slides.`);
      setPdfReady(slides.length > 0);
    };
    checkSlides();
    console.log("Setting up MutationObserver for slides...");
    const observer = new MutationObserver(checkSlides);
    console.log("Setting up MutationObserver for viewerRef...");
    observer.observe(viewerRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [viewerRef, pdfLink, file]);

  return (
    <div className="flex items-start gap-x-8 h-[71vh] relative">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-white bg-opacity-70 z-10">
          <ClipLoader color="#3E4784" size={100} />
        </div>
      )}
      <DocMenu participants={participants} />
      <div className="relative flex-1 h-full">
        <PdfViewer
          setCurrentSlideIndex={setCurrentSlideIndex}
          currentSlideIndex={currentSlideIndex}
          activeRecipientEmail={activeRecipientEmail}
          setPdfLoad={setPdfLoad}
          queryPdfUrl={queryPdfUrl}
          signatures={signatures}
          viewerRef={viewerRef}
          pdfLink={pdfLink}
          file={selectedFile}
        />
        {/* Renderiza las firmas solo cuando el PDF está listo y hay slides */}
        {pdfReady &&
          signatures.map((signature) => {
            const slides = viewerRef.current?.querySelectorAll(
              ".pdf-slide, .image-slide",
            );
            const slide = slides?.[signature.slideIndex] as
              | HTMLElement
              | undefined;
            if (!slide) return null;
            return (
              <SignItem
                key={signature.id}
                color={String(signature.color)}
                top={signature.top}
                left={signature.left}
                slideIndex={signature.slideIndex}
                positionStyle={{
                  position: "absolute",
                  top: `${signature.top * 100}%`,
                  left: `${signature.left * 100}%`,
                  zIndex: 10,
                }}
                slideElement={slide}
                viewerRef={viewerRef}
                setSignatures={setSignatures}
                currentSlideIndex={currentSlideIndex}
                height={Number(signature.height)}
                width={Number(signature.width)}
                id={String(signature.id)}
                sign={signature}
              />
            );
          })}
      </div>
    </div>
  );
};
