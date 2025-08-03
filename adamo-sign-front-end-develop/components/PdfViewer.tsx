"use client";

import { Signature } from "@/types";
// @ts-expect-error TS4
import * as pdfjsLib from "pdfjs-dist/webpack";

import React, { useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js";

interface PdfViewerProps {
  pdfLink: string | null;
  file: File | null;
  setCurrentSlideIndex: (index: number) => void;
  currentSlideIndex: number;
  viewerRef: React.MutableRefObject<any>;
  queryPdfUrl: string | null;
  setPdfLoad: (load: boolean) => void;
  signatures: Signature[];
  activeRecipientEmail: string;
  setCanvasBox?: (box: any) => void;
  setSlideHeights?: (heights: any) => void;
  adminEmailPdfUrl?: string;
}

export const PdfViewer = ({
  pdfLink,
  file,
  setCurrentSlideIndex,
  viewerRef,
  setCanvasBox,
  setSlideHeights,
  queryPdfUrl,
  adminEmailPdfUrl,
  signatures,
  activeRecipientEmail,
  setPdfLoad,
  currentSlideIndex,
}: PdfViewerProps) => {
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  const [isOverflowX, setIsOverflowX] = useState(false);

  const [fileType, setFileType] = useState<string | null>(null);
  const slideHeightsRef = useRef<Array<number>>([]);
  const renderedOnceRef = useRef(false);
  const scrollToSlide = (slideIndex: number) => {
    const slides = viewerRef.current.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    if (slides[slideIndex]) {
      viewerRef.current.scrollTo({
        top: slides[slideIndex].offsetTop,
        behavior: "smooth",
      });
      setCurrentSlideIndex(slideIndex);
    }
  };

  const moveToNextEditableSlide = () => {
    if (!activeRecipientEmail) {
      console.warn("No activeRecipientEmail provided, skipping scroll");
      return;
    }

    const recipientSignatures = signatures.filter(
      (sig) => sig.recipientEmail === activeRecipientEmail,
    );

    const sortedSignatures = recipientSignatures.sort(
      (a, b) => a.slideIndex - b.slideIndex,
    );

    const nextEditableSignature = sortedSignatures.find(
      (sig) => !sig.signatureIsEdit,
    );

    if (!nextEditableSignature) {
      console.warn("No editable signature found");
      return;
    }

    const { slideIndex } = nextEditableSignature;
    if (slideIndex !== currentSlideIndex) {
      scrollToSlide(slideIndex);
      setCurrentSlideIndex(slideIndex);
    } else {
      console.log("Slide is already in focus, no scrolling required.");
    }
  };

  useEffect(() => {
    moveToNextEditableSlide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatures, activeRecipientEmail]);

  useEffect(() => {
    const fetchFile = async (fileSource: string) => {
      try {
        const response = await fetch(fileSource);
        const blob = await response.blob();
        setFileContent(blob);
        setFileType(blob.type);
      } catch (error) {
        console.error("Failed to fetch file:", error);
      }
    };

    if (pdfLink) {
      fetchFile(pdfLink);
    } else if (file) {
      setFileContent(file);
      setFileType(file.type);
    }
  }, [pdfLink, file]);

  useEffect(() => {
    console.log("File content or type changed, re-rendering PDF viewer...");
    if (
      (!fileContent && !queryPdfUrl && !adminEmailPdfUrl) ||
      !viewerRef.current
    ) {
      console.log(
        "Exiting: Missing fileContent, queryPdfUrl, adminEmailPdfUrl, or viewerRef",
      );
      console.warn(
        "Exiting: Missing fileContent, queryPdfUrl, adminEmailPdfUrl, or viewerRef",
      );
      return;
    }

    const renderFile = async () => {
      console.log("Rendering file...");
      if (renderedOnceRef.current) {
        console.log("Already rendered once, skipping re-render.");
        return;
      }
      renderedOnceRef.current = true;

      const viewer = viewerRef.current;
      viewer.style.position = "relative";
      viewer.innerHTML = "";
      console.log("Viewer cleared and set to relative position");

      try {
        if (fileType === "application/pdf" || queryPdfUrl || adminEmailPdfUrl) {
          console.log("Rendering PDF file...");
          setPdfLoad(true);
          const pdfUrl =
            queryPdfUrl ||
            adminEmailPdfUrl ||
            (typeof fileContent === "string"
              ? fileContent
              : fileContent?.size
                ? URL.createObjectURL(fileContent)
                : null);

          console.log("PDF URL:", pdfUrl);
          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;

          console.log("PDF loaded, number of pages:", pdf.numPages);
          const scale = 2;

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            console.log(`Rendering page ${pageNum}...`);
            const page = await pdf.getPage(pageNum);

            console.log(`Page ${pageNum} loaded, creating canvas...`);
            const canvasContainer = document.createElement("div");
            console.log(`Canvas container created for page ${pageNum}`);
            setCanvasBox?.(canvasContainer);
            console.log("Setting canvas container styles...");
            canvasContainer.style.position = "relative";
            canvasContainer.className = "pdf-slide";
            canvasContainer.dataset.slideIndex = String(pageNum - 1);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvasContainer.appendChild(canvas);
            viewer.appendChild(canvasContainer);

            const viewport = page.getViewport({ scale });
            const dpr = window.devicePixelRatio || 1;

            const width = viewport.width;
            const height = viewport.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            context?.scale(dpr, dpr);

            const maxWidth = 1280;
            const adjustedWidth = Math.min(width, maxWidth);
            const adjustedHeight = (adjustedWidth / width) * height;

            canvas.style.width = `100%`;
            canvas.style.height = `${adjustedHeight}px`;

            canvasContainer.style.backgroundColor = "white";
            canvasContainer.style.width = `${adjustedWidth}px`;
            canvasContainer.style.height = `${adjustedHeight}px`;
            canvasContainer.style.margin = "0 auto";
            canvasContainer.style.scrollbarWidth = "none";

            if (window.innerWidth > 1280) {
              canvasContainer.style.maxWidth = "1280px";
            }

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
          }
          setPdfLoad(false);
        }

        if (fileType?.startsWith("image/")) {
          const imgUrl =
            typeof fileContent === "string"
              ? fileContent
              : fileContent?.size
                ? URL.createObjectURL(fileContent)
                : null;

          if (!imgUrl) {
            console.warn("Invalid image file");
            return;
          }

          const imgSlideContainer = document.createElement("div");
          imgSlideContainer.className = "image-slide";
          imgSlideContainer.style.position = "relative";

          const imgElement = document.createElement("img");
          imgElement.src = imgUrl;
          imgElement.style.width = "100%";
          imgElement.style.height = "auto";
          imgElement.style.objectFit = "contain";
          imgElement.alt = "Uploaded Image";

          imgSlideContainer.appendChild(imgElement);
          viewer.appendChild(imgSlideContainer);
        }

        const firstRelevantSlide = signatures.find(
          (sig) =>
            sig.recipientEmail === activeRecipientEmail && !sig.signatureIsEdit,
        )?.slideIndex;

        if (firstRelevantSlide !== undefined) {
          scrollToSlide(firstRelevantSlide);
        }

        setPdfLoad(true);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error rendering file:", error.message, error.stack);
        } else {
          console.error("Error rendering file:", error);
        }

        setPdfLoad(false);
      }
    };

    renderFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fileContent,
    fileType,
    queryPdfUrl,
    adminEmailPdfUrl,
    viewerRef,
    setCanvasBox,
  ]);

  useEffect(() => {
    if (!viewerRef.current) return;
    console.log("Setting up slide height observer...");

    const calculateSlideHeights = () => {
      console.log("Calculating slide heights...");
      const slides = viewerRef.current.querySelectorAll(
        ".pdf-slide, .image-slide",
      );
      const heights = Array.from(slides).map(
        (slide) => (slide as HTMLElement).offsetHeight,
      );
      console.log("Slide heights:", heights);

      if (JSON.stringify(slideHeightsRef.current) !== JSON.stringify(heights)) {
        console.log("Slide heights changed, updating state...");
        slideHeightsRef.current = heights;
        setSlideHeights?.(heights);
      }
    };

    calculateSlideHeights();
    const observer = new MutationObserver(calculateSlideHeights);
    observer.observe(viewerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [viewerRef, setSlideHeights]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const slides = viewerRef.current.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    const containerHeight = (e.target as HTMLDivElement).offsetHeight;

    slides.forEach((slide: HTMLDivElement, index: number) => {
      const slideTop = slide.offsetTop - viewerRef.current.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;

      console.log(
        `Slide ${index}: Top=${slideTop}, Bottom=${slideBottom}, ScrollTop=${scrollTop}, ContainerHeight=${containerHeight}`,
      );
      if (
        scrollTop + containerHeight / 2 >= slideTop &&
        scrollTop + containerHeight / 2 < slideBottom
      ) {
        setCurrentSlideIndex?.(index);
      }
    });
  };

  useEffect(() => {
    if (!viewerRef.current) return;

    const checkOverflow = () => {
      const container = viewerRef.current;
      const hasOverflowX = container.scrollWidth > container.clientWidth;
      console.log("Horizontal overflow:", hasOverflowX);

      setIsOverflowX(hasOverflowX);
    };

    checkOverflow();
    const observer = new MutationObserver(checkOverflow);
    observer.observe(viewerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [viewerRef]);

  return (
    <>
      <div
        className={`w-full h-full p-10 flex flex-col gap-10 justify-start items-${isOverflowX ? "start" : "center"} bg-[#EFEDEC] overflow-auto mx-auto`}
        ref={viewerRef}
        onScroll={handleScroll}
      ></div>
    </>
  );
};
