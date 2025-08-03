"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useFile } from "@/context/FileContext";
import { useSignatureData } from "@/context/SignatureContext";

import { PdfViewer } from "@/components/PdfViewer";
import { useSidebar } from "@/components/Sidebar/Sidebar";
import DocMenu from "@/components/ui/DocMenu";

const Page = () => {
  const [selectFile, setSelectedFile] = useState<File | null>(null);
  const { getValues } = useForm();

  const { file } = useFile();
  const viewerRef = useRef();

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
    setDocumentName,
    setSignatures,
    setActiveRecipientEmail,
    setActiveUserOfQuery,
    setTokenOfQuery,
    
  } = useSignatureData();

  console.log("signatures in app/doc",signatures);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryString = window.location.search;
      if (queryString) {
        const queryParams = new URLSearchParams(queryString);

        const token = queryParams.get("token");
        const activeEmail = queryParams.get("email");
        const activeUserName = queryParams.get("name");
        const documentName = queryParams.get("documentName");

        setTokenOfQuery(String(token));
        setDocumentName(documentName);
        setActiveUserOfQuery(String(activeUserName));
        setActiveRecipientEmail(String(activeEmail));

        fetch(`${process.env.REACT_APP_S3_BUCKETURL}/User+Data/${token}.json`)
          .then((response) => response.json())
          .then((data) => {
            setPdfLink(data.emailPdfUrl);
            setSignatures([...data.signatures]);
          })
          .catch((error) => {
            console.error("Error in Fetching Data:", error);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewerRef.current) {
      setViewerRef(viewerRef);
    }
  }, [viewerRef, setViewerRef]);

  useEffect(() => {
    if (typeof file === "string" && file.startsWith("http")) {
      setPdfLink(file);
      setSelectedFile(null);
    } else if (file instanceof File) {
      setSelectedFile(file);
      setPdfLink(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const participants = getValues("participants");
  const { setOpen } = useSidebar();

  useEffect(() => {
    setOpen(false);
    return () => setOpen(true);
  }, [setOpen]);

  return (
    <div className="flex items-start gap-x-8 h-[100vh]">
      <DocMenu participants={participants} />
      <PdfViewer
        setCurrentSlideIndex={setCurrentSlideIndex}
        currentSlideIndex={currentSlideIndex}
        activeRecipientEmail={activeRecipientEmail}
        setPdfLoad={setPdfLoad}
        queryPdfUrl={queryPdfUrl}
        signatures={signatures}
        viewerRef={viewerRef}
        pdfLink={pdfLink}
        file={selectFile}
      />
    </div>
  );
};

export default Page;
