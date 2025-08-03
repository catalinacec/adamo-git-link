// src/hooks/useDocumentLoader.ts
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
//import { PDFDocument } from "pdf-lib";
//import * as fontkit from "fontkit";
//import { v4 as uuidv4 } from "uuid";
import type { Signature } from "@/types";
import {
  toArrayBuffer,
  streamToArrayBuffer,
  s3Client,
//  fontUrls,
//  fetchFontBytes,
} from "@/utils/pdf";

interface InitialData {
  data: {
    document: any;
    signerId: string;
    // …otros campos si los usas
  };
}

/**
 * Hook para cargar el documento desde la API, manejar redirección en caso de "rejected",
 * obtener el PDF desde S3 (o fallback URL), y extraer metadata y signatures.
 */
export function useDocumentLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pdfLink, setPdfLink] = useState<string>("");
  const [queryPdfUrl, setQueryPdfUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [signerId, setSignerId] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [activeRecipientEmail, setActiveRecipientEmail] = useState<string>("");
  const [activeUserOfQuery, setActiveUserOfQuery] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const token = searchParams.get("data");
      if (!token) return;

      setVerifyToken(token);

      // 1) Llamada inicial a /documents/sign/:token
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/sign/${token}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) {
        console.error("Error fetching document:", res.status, await res.text());
        return;
      }
      const json: InitialData = await res.json();
      const { document, signerId: sid } = json.data;

      // 2) Redirigir si está rechazado
      if (document.status === "rejected") {
        sessionStorage.setItem("rejectedData", JSON.stringify(json.data));
        sessionStorage.setItem("rejectedPdfUrl", document.metadata?.url || "");
        router.push("/rejected");
        return;
      }

      // 3) Guardar metadata básica
      setInitialData(json);
      setDocumentName(document.filename || "");
      setDocumentId(document.documentId || null);
      setSignerId(sid || null);
      sessionStorage.setItem("initialData", JSON.stringify(json.data));
      sessionStorage.setItem("rejectedPdfUrl", document.metadata?.url || "");

      // 4) Descargar PDF: preferir S3, fallback a URL pública
      let objectUrl: string | null = null;
      if (document.metadata?.s3Key) {
        try {
          const cmd = new GetObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
            Key: document.metadata.s3Key,
          });
          const s3res = await s3Client.send(cmd);
          const body = s3res.Body!;
          let buf: ArrayBuffer;
          if (body instanceof ReadableStream) {
            buf = await streamToArrayBuffer(body);
          } else if (ArrayBuffer.isView(body as any)) {
            buf = toArrayBuffer(body as any);
          } else {
            buf = await (body as Blob).arrayBuffer();
          }
          const blob = new Blob([buf], { type: document.metadata.mimetype || "application/pdf" });
          objectUrl = URL.createObjectURL(blob);
        } catch (err) {
          console.warn("S3 download failed, trying public URL", err);
        }
      }
      if (!objectUrl && document.metadata?.url) {
        try {
          const publicRes = await fetch(document.metadata.url);
          if (publicRes.ok) {
            const buf = await publicRes.arrayBuffer();
            const blob = new Blob([buf], { type: document.metadata.mimetype || "application/pdf" });
            objectUrl = URL.createObjectURL(blob);
          }
        } catch (err) {
          console.error("Public URL download failed", err);
        }
      }
      if (objectUrl) {
        setPdfLink(objectUrl);
        setQueryPdfUrl(objectUrl);
      }

      // 5) Extraer participante activo y sus firmas
      const participants = Array.isArray(document.participants)
        ? document.participants
        : [];
      const active = participants.find((p: any) => p.uuid === sid);
      if (active) {
        setActiveRecipientEmail(active.email);
        const name = [active.first_name, active.last_name].filter(Boolean).join(" ");
        setActiveUserOfQuery(name);
        const initSigs: Signature[] = (active.signatures || []).map((s: any) => ({
          id: s.id,
          recipientEmail: s.recipientEmail,
          recipientsName: s.recipientsName,
          signatureText: s.signatureText || "",
          signature: "",
          signatureIsEdit: false,
          slideIndex: s.slideIndex,
          left: s.left,
          top: s.top,
          width: s.width,
          height: s.height,
        }));
        setSignatures(initSigs);
      }
    }

    fetchData().catch(err => console.error("useDocumentLoader:", err));
  }, [searchParams, router]);

  return {
    pdfLink,
    queryPdfUrl,
    documentName,
    documentId,
    signerId,
    verifyToken,
    initialData,
    signatures,
    activeRecipientEmail,
    activeUserOfQuery,
  };
}
