"use client";

import { Signature } from "@/types";
// @ts-expect-error TS4
import * as pdfjsLib from "pdfjs-dist/webpack";

import React, { useEffect, useRef, useState } from "react";

import "../../app/globals.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js";

interface PdfViewerProps {
  pdfLink: string | null;
  file?: File | null;
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [fileType, setFileType] = useState<string | null>(null);
  const slideHeightsRef = useRef<Array<number>>([]);
  const renderedOnceRef = useRef(false);
  const renderingInProgressRef = useRef(false);
  const renderedPagesRef = useRef(new Set<number>());
  const pdfInstanceRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const pdfRenderingCancelledRef = useRef(false);
  const isMountedRef = useRef(true);
  const initialRenderDoneRef = useRef(false);

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
  }, [signatures, activeRecipientEmail]);

  useEffect(() => {
    const fetchFile = async (fileSource: string) => {
      try {
        setPdfLoad(true);

        const response = await fetch(fileSource);
        const blob = await response.blob();

        setFileContent(blob);
        setFileType(blob.type);
      } catch (error) {
        console.error("Failed to fetch file:", error);
      } finally {
        setPdfLoad(false);
      }
    };

    if (pdfLink) {
      fetchFile(pdfLink);
    } else if (file) {
      setPdfLoad(true);
      setFileContent(file);
      setFileType(file.type);
      setPdfLoad(false);
    }
  }, [pdfLink, file]);

  // Clean up function to properly destroy PDF instances
  const cleanupPdfResources = async (shouldCancel = true) => {
    try {
      // Only cancel rendering if explicitly requested
      if (shouldCancel) {
        pdfRenderingCancelledRef.current = true;
      }

      // Clean up loading task if it exists
      if (loadingTaskRef.current) {
        try {
          await loadingTaskRef.current.destroy();
        } catch (err) {
          console.warn("Error destroying loading task:", err);
        } finally {
          loadingTaskRef.current = null;
        }
      }

      // Clean up PDF instance if it exists
      if (pdfInstanceRef.current) {
        try {
          await pdfInstanceRef.current.destroy();
        } catch (err) {
          console.warn("Error destroying PDF instance:", err);
        } finally {
          pdfInstanceRef.current = null;
        }
      }
    } catch (err) {
      console.warn("Error during PDF resource cleanup:", err);
    }
  };

  // Track component mount status to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Modified resize handler to better handle resource cleanup
  useEffect(() => {
    const handleResize = async () => {
      if (!isMountedRef.current) return;

      setWindowWidth(window.innerWidth);

      if (viewerRef.current && !renderingInProgressRef.current) {
        // Set flags to prevent duplicate rendering
        renderedOnceRef.current = false;

        // Properly clean up before re-rendering but don't set cancellation flag
        // This allows more graceful resizing without error messages
        await cleanupPdfResources(false);

        // Clear the viewer to prepare for re-rendering
        if (viewerRef.current && isMountedRef.current) {
          viewerRef.current.innerHTML = "";

          // Reset cancellation flag before re-rendering
          pdfRenderingCancelledRef.current = false;

          // Add a timeout to ensure resize events are settled
          setTimeout(() => {
            if (isMountedRef.current) {
              renderFile();
            }
          }, 300);
        }
      }
    };

    const debouncedResize = debounce(handleResize, 250);
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [fileContent, fileType, queryPdfUrl, adminEmailPdfUrl]);

  // Debounce function to prevent multiple rapid executions
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: any[]) {
      const later = () => {
        timeout = null;
        func(...args);
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
    };
  };

  // Modified renderFile function to better handle initial rendering
  const renderFile = async () => {
    if (
      !isMountedRef.current ||
      !viewerRef.current ||
      (!fileContent && !queryPdfUrl && !adminEmailPdfUrl)
    ) {
      console.warn(
        "Missing required elements for rendering or component unmounted",
      );
      return;
    }

    // Prevent duplicate rendering
    if (renderedOnceRef.current || renderingInProgressRef.current) {
      return;
    }

    // Reset cancellation flag at the beginning of rendering
    pdfRenderingCancelledRef.current = false;

    // Set flag to indicate rendering is in progress
    renderingInProgressRef.current = true;

    try {
      // First make sure we have a clean slate
      // When doing initial render, we don't want to set the cancellation flag
      await cleanupPdfResources(false);

      // Clear viewer before rendering
      const viewer = viewerRef.current;
      if (!viewer) {
        console.warn("Viewer ref is no longer available");
        return;
      }

      viewer.style.position = "relative";
      viewer.innerHTML = "";

      // Reset the set of rendered pages
      renderedPagesRef.current = new Set<number>();

      if (!isMountedRef.current) return;
      setPdfLoad(true);

      if (fileType === "application/pdf" || queryPdfUrl || adminEmailPdfUrl) {
        const pdfUrl =
          queryPdfUrl ||
          adminEmailPdfUrl ||
          (typeof fileContent === "string"
            ? fileContent
            : fileContent?.size
              ? URL.createObjectURL(fileContent)
              : null);

        if (!pdfUrl) {
          console.warn("No valid PDF URL found");
          if (isMountedRef.current) {
            setPdfLoad(false);
            renderingInProgressRef.current = false;
          }
          return;
        }

        try {
          console.log("Starting PDF load from URL:", pdfUrl);

          // Create a new loading task and store the reference
          loadingTaskRef.current = pdfjsLib.getDocument({
            url: pdfUrl,
            cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/",
            cMapPacked: true,
            disableStream: false,
            disableAutoFetch: false,
          });

          // Wait for the PDF to load
          const pdf = await loadingTaskRef.current.promise;
          console.log("PDF loaded successfully with", pdf.numPages, "pages");

          pdfInstanceRef.current = pdf;

          // If rendering was cancelled during loading, abort
          if (pdfRenderingCancelledRef.current || !isMountedRef.current) {
            console.log(
              "PDF rendering was cancelled during loading or component unmounted",
            );
            return;
          }

          // Calculate the scale based on window width
          const baseScale = 2;
          const responsiveScale =
            baseScale *
            (windowWidth < 768 ? 0.7 : windowWidth < 1024 ? 0.85 : 1);

          // First get the total number of pages to render
          const totalPages = pdf.numPages;
          console.log(`Rendering ${totalPages} pages`);

          for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            // Check if rendering was cancelled or component unmounted
            if (pdfRenderingCancelledRef.current || !isMountedRef.current) {
              console.log(
                "PDF rendering was cancelled during page rendering or component unmounted",
              );
              break;
            }

            console.log(`Rendering page ${pageNum}`);

            // Skip if this page has already been rendered (prevents duplication)
            if (renderedPagesRef.current.has(pageNum)) {
              console.log(`Page ${pageNum} was already rendered, skipping`);
              continue;
            }

            // Mark this page as being rendered
            renderedPagesRef.current.add(pageNum);

            const page = await pdf.getPage(pageNum);

            // Check again if cancelled after page load
            if (pdfRenderingCancelledRef.current || !isMountedRef.current)
              break;

            const canvasContainer = document.createElement("div");
            setCanvasBox?.(canvasContainer);
            canvasContainer.style.position = "relative";
            canvasContainer.className = "pdf-slide";
            canvasContainer.dataset.slideIndex = String(pageNum - 1);
            canvasContainer.dataset.pageNumber = String(pageNum);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) {
              console.error("Could not get canvas context");
              continue;
            }

            canvasContainer.appendChild(canvas);
            viewer.appendChild(canvasContainer);

            const viewport = page.getViewport({ scale: responsiveScale });
            const dpr = window.devicePixelRatio || 1;

            const width = viewport.width;
            const height = viewport.height;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            context.scale(dpr, dpr);

            // Calculate container width based on viewport
            const containerWidth = Math.min(width, windowWidth * 0.9);
            const containerHeight = (containerWidth / width) * height;

            canvas.style.width = `${containerWidth}px`;
            canvas.style.height = `${containerHeight}px`;

            canvasContainer.style.backgroundColor = "white";
            canvasContainer.style.width = `${containerWidth}px`;
            canvasContainer.style.height = `${containerHeight}px`;
            canvasContainer.style.margin = "0 auto 20px auto"; // Added margin to separate pages
            canvasContainer.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
            canvasContainer.style.borderRadius = "4px";

            try {
              const renderTask = page.render({
                canvasContext: context,
                viewport: viewport,
              });

              await renderTask.promise;
              console.log(`Page ${pageNum} rendered successfully`);

              // Release page resources when done
              page.cleanup();
            } catch (renderError: any) {
              // Check if it's a cancellation error, which is expected during cleanup
              if (renderError.name === "RenderingCancelledException") {
                console.log(`Rendering of page ${pageNum} was cancelled`);
              } else {
                console.error(`Error rendering page ${pageNum}:`, renderError);
              }
            }
          }

          console.log("All pages rendered successfully");
        } catch (pdfError: any) {
          // Ignore worker destruction errors which are expected during cleanup
          if (
            pdfError.message &&
            pdfError.message.includes("worker is being destroyed")
          ) {
            console.log(
              "PDF worker destruction detected - part of normal cleanup",
            );
          } else {
            console.error("Error loading PDF:", pdfError);
          }
        }
      }

      if (fileType?.startsWith("image/")) {
        setPdfLoad(true);
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
        imgSlideContainer.dataset.slideIndex = "0";
        imgSlideContainer.style.position = "relative";
        imgSlideContainer.style.margin = "0 auto";
        imgSlideContainer.style.maxWidth = `${Math.min(windowWidth * 0.9, 1280)}px`;
        imgSlideContainer.style.width = "100%";
        imgSlideContainer.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
        imgSlideContainer.style.borderRadius = "4px";
        imgSlideContainer.style.backgroundColor = "white";

        const imgElement = document.createElement("img");
        imgElement.src = imgUrl;
        imgElement.style.width = "100%";
        imgElement.style.height = "auto";
        imgElement.style.objectFit = "contain";
        imgElement.style.maxHeight = `${windowWidth < 768 ? "70vh" : "85vh"}`;
        imgElement.alt = "Uploaded Image";

        // Create a wrapper to maintain aspect ratio
        const imgWrapper = document.createElement("div");
        imgWrapper.style.width = "100%";
        imgWrapper.style.display = "flex";
        imgWrapper.style.justifyContent = "center";
        imgWrapper.style.alignItems = "center";

        imgWrapper.appendChild(imgElement);
        imgSlideContainer.appendChild(imgWrapper);
        viewer.appendChild(imgSlideContainer);
        setPdfLoad(false);
      }

      // Set flag indicating we've rendered the document (only if not cancelled)
      if (!pdfRenderingCancelledRef.current && isMountedRef.current) {
        renderedOnceRef.current = true;
        initialRenderDoneRef.current = true;

        // Handle initial scroll to signature if needed
        const firstRelevantSlide = signatures.find(
          (sig) =>
            sig.recipientEmail === activeRecipientEmail && !sig.signatureIsEdit,
        )?.slideIndex;

        if (firstRelevantSlide !== undefined) {
          scrollToSlide(firstRelevantSlide);
        }
      }
    } catch (error) {
      console.error("Error rendering file:", error);
    } finally {
      if (isMountedRef.current) {
        setPdfLoad(false);
        renderingInProgressRef.current = false;
      }
    }
  };

  // Cleanup effect to handle component unmounting
  useEffect(() => {
    return () => {
      // Update the mounted ref
      isMountedRef.current = false;

      // Clean up PDF resources
      cleanupPdfResources(true);

      // Clear any object URLs we may have created
      if (fileContent && typeof fileContent !== "string" && fileContent.size) {
        try {
          URL.revokeObjectURL(URL.createObjectURL(fileContent));
        } catch (e) {
          console.warn("Error revoking object URL:", e);
        }
      }
    };
  }, []);

  // Main effect to trigger document rendering
  useEffect(() => {
    if (
      (!fileContent && !queryPdfUrl && !adminEmailPdfUrl) ||
      !viewerRef.current
    ) {
      console.warn(
        "Exiting: Missing fileContent, queryPdfUrl, adminEmailPdfUrl, or viewerRef",
      );
      return;
    }

    console.log("Starting document rendering process");

    // Reset flags to ensure we can render
    renderedOnceRef.current = false;
    renderingInProgressRef.current = false;
    renderedPagesRef.current.clear();
    pdfRenderingCancelledRef.current = false;

    // Clear the viewer before rendering
    if (viewerRef.current) {
      viewerRef.current.innerHTML = "";
    }

    // Don't await cleanup to avoid blocking initial render
    cleanupPdfResources(false).then(() => {
      // Small delay to prevent conflicts with other effects
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current) {
            renderFile();
          }
        }, 100);
      }
    });

    // Cleanup function for when dependencies change
    return () => {
      console.log("Cleaning up from dependency change");
      // Flag that rendering should be cancelled
      pdfRenderingCancelledRef.current = true;

      // Don't await cleanup in the return function to avoid blocking
      cleanupPdfResources(true);

      if (viewerRef.current) {
        viewerRef.current.innerHTML = "";
      }
      renderedOnceRef.current = false;
      renderingInProgressRef.current = false;
      renderedPagesRef.current.clear();
    };
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

    const calculateSlideHeights = () => {
      const slides = viewerRef.current.querySelectorAll(
        ".pdf-slide, .image-slide",
      );
      const heights = Array.from(slides).map(
        (slide) => (slide as HTMLElement).offsetHeight,
      );

      if (JSON.stringify(slideHeightsRef.current) !== JSON.stringify(heights)) {
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
      className={`scrollable w-full h-[calc(100vh-132px)] mt-5 ${isOverflowX ? "" : "px-4 py-6 md:p-10"} flex flex-col gap-6 md:gap-10 justify-start items-${isOverflowX ? "start" : "center"} bg-[#EFEDEC] overflow-auto mx-auto`}
      ref={viewerRef}
      onScroll={handleScroll}
    ></div>
  );
};
