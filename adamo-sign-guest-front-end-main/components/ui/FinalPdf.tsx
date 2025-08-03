"use client";

// @ts-expect-error TS4
import * as pdfjsLib from "pdfjs-dist/webpack";

import React, { useEffect, useRef, useState } from "react";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js";

interface FinalPdfProps {
  pdfLink: string | null;
  file?: File | null;
  setCurrentSlideIndex: (index: number) => void;
  currentSlideIndex: number;
  viewerRef: React.MutableRefObject<any>;
  queryPdfUrl: string | null;
}

export const FinalPdf = ({
  pdfLink,
  file,
  setCurrentSlideIndex,
  viewerRef,
  queryPdfUrl,
}: FinalPdfProps) => {
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  const [isOverflowX, setIsOverflowX] = useState(false);

  const [fileType, setFileType] = useState<string | null>(null);
  const slideHeightsRef = useRef<Array<number>>([]);
  const renderedOnceRef = useRef(false);

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
    if ((!fileContent && !queryPdfUrl) || !viewerRef.current) {
      console.warn(
        "Exiting: Missing fileContent, queryPdfUrl, adminEmailPdfUrl, or viewerRef",
      );
      return;
    }

    const renderFile = async () => {
      if (renderedOnceRef.current) {
        return;
      }
      renderedOnceRef.current = true;

      const viewer = viewerRef.current;
      viewer.style.position = "relative";
      viewer.innerHTML = "";

      try {
        if (fileType === "application/pdf" || queryPdfUrl) {
          const pdfUrl =
            queryPdfUrl ||
            (typeof fileContent === "string"
              ? fileContent
              : fileContent?.size
                ? URL.createObjectURL(fileContent)
                : null);

          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);

            const canvasContainer = document.createElement("div");
            canvasContainer.style.position = "relative";

            canvasContainer.className = "pdf-slide";
            canvasContainer.dataset.slideIndex = String(pageNum - 1);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvasContainer.appendChild(canvas);
            viewer.appendChild(canvasContainer);

            const scale = 1;
            const viewport = page.getViewport({ scale });
            const dpr = window.devicePixelRatio || 1;

            const width = viewport.width;
            const height = viewport.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            context?.scale(dpr, dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            canvasContainer.style.width = `${width}px`;
            canvasContainer.style.height = `${height}px`;
            canvasContainer.style.scrollbarWidth = "none";

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;
          }
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
          imgElement.style.width = "100%"; // Ensure image fits the container width
          imgElement.style.height = "auto"; // Maintain aspect ratio
          imgElement.style.objectFit = "contain"; // Ensure the image fits within the container without distortion
          imgElement.alt = "Uploaded Image";

          imgSlideContainer.appendChild(imgElement);
          viewer.appendChild(imgSlideContainer);
        }
      } catch (error) {
        console.error("Error rendering file:", error);
      }
    };

    renderFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent, fileType, queryPdfUrl, viewerRef]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const calculateSlideHeights = () => {
      const slides = viewerRef.current.querySelectorAll(
        ".pdf-slide, .image-slide",
      );
      const heights = Array.from(slides).map(
        (slide) => (slide as HTMLElement).offsetHeight,
      );

      if (JSON.stringify(slideHeightsRef.current) !== JSON.stringify(heights)) {
        slideHeightsRef.current = heights;
      }
    };

    calculateSlideHeights();
    const observer = new MutationObserver(calculateSlideHeights);
    observer.observe(viewerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [viewerRef]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const slides = viewerRef.current.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    const containerHeight = (e.target as HTMLDivElement).offsetHeight;

    slides.forEach((slide: HTMLDivElement, index: number) => {
      const slideTop = slide.offsetTop - viewerRef.current.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;

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
      const hasOverflowX =
        viewerRef.current.scrollWidth > viewerRef.current.clientWidth;
      setIsOverflowX(hasOverflowX);
    };

    checkOverflow();
    const observer = new MutationObserver(checkOverflow);
    observer.observe(viewerRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [viewerRef]);

  return (
    <div
      className={`w-[90%] mt-5 h-full ${isOverflowX ? "" : "p-10"}  flex flex-col gap-10 justify-start items-${isOverflowX ? "start" : "center"} bg-[#EFEDEC] overflow-auto mx-auto`}
      ref={viewerRef}
      onScroll={handleScroll}
    ></div>
  );
};
