import React, { useLayoutEffect, useCallback, useRef } from "react";
import type { Signature } from "@/types";

type ReactElementObj = {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: ReactElementObj | ReactElementObj[] | string;
  } & Record<string, any>;
};

function parseReactToHTML(reactObj: string | ReactElementObj): string {
  if (typeof reactObj === "string") return reactObj;

  const { type, props } = reactObj;
  const { style, children, ...other } = props;

  const styleString = style
    ? Object.entries(style)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}:${v}`)
      .join(";")
    : "";

  const attrs = Object.entries(other)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

  const selfClosing = ["img", "br", "hr", "input"];
  if (selfClosing.includes(type)) {
    return `<${type} style="${styleString}" ${attrs}/>`;
  }

  const childrenHTML = Array.isArray(children)
    ? children.map(parseReactToHTML).join("")
    : children
      ? parseReactToHTML(children as any)
      : "";

  return `<${type} style="${styleString}" ${attrs}>${childrenHTML}</${type}>`;
}

// Función para convertir hex a rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Función para oscurecer un color hex
function darkenHex(hex: string, percent: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return hex;

  const r = Math.max(0, parseInt(result[1], 16) - Math.round(255 * percent / 100));
  const g = Math.max(0, parseInt(result[2], 16) - Math.round(255 * percent / 100));
  const b = Math.max(0, parseInt(result[3], 16) - Math.round(255 * percent / 100));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function SignatureOverlay({
  signatures,
  activeRecipientEmail,
  viewerRef,
  pdfLoad,
  onEdit,
}: {
  signatures: Signature[];
  activeRecipientEmail: string;
  viewerRef: React.RefObject<HTMLDivElement>;
  pdfLoad: boolean;
  onEdit: (sig: Signature) => void;
}) {
  const retryCountRef = useRef(0);
  const maxRetries = 50;
  const retryDelay = 100;

  const renderSignatures = useCallback(() => {
    const container = viewerRef.current;
    if (!container) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(renderSignatures, retryDelay);
      }
      return;
    }

    const slides = container.querySelectorAll<HTMLDivElement>(
      ".pdf-slide, .image-slide"
    );

    if (slides.length === 0) {
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        setTimeout(renderSignatures, retryDelay);
      }
      return;
    }

    retryCountRef.current = 0;

    signatures.forEach((sig) => {
      const target = slides[sig.slideIndex];
      if (!target) return;

      const {
        left,
        top,
        width = 0,
        height = 0,
        id,
        recipientEmail,
        signature,
        signatureText,
        signatureIsEdit,
        color
      } = sig;

      const isActive = recipientEmail === activeRecipientEmail;
      const isSigned = signatureIsEdit || signatureText || signature;

      let html = "";
      let displayText = "";

      if (signatureText) {
        html = `<span>${signatureText}</span>`;
      } else if (
        typeof signature === "string" &&
        signature.startsWith("data:image/")
      ) {
        // Mostrar la imagen de la firma dibujada o cargada
        html = `<img src="${signature}" style="max-width:100%;max-height:100%;object-fit:contain;"/>`;
      } else if (React.isValidElement(signature)) {
        const src = (signature.props as any).src;
        html = src
          ? `<img src="${src}" style="max-width:100%;max-height:100%;object-fit:contain;"/>`
          : parseReactToHTML(signature as any);
      } else {
        if (isActive) {
          displayText = isSigned ? "Firmado" : "Haz clic para firmar";
        } else {
          displayText = isSigned ? "Firmado" : `Firma de ${recipientEmail}`;
        }
        html = `<span style="font-size: 0.7rem; text-align: center;">${displayText}</span>`;
      }

      let div = target.querySelector<HTMLDivElement>(`[data-id="${id}"]`);
      if (!div) {
        div = document.createElement("div");
        div.dataset.id = id;
        div.dataset.recipientEmail = recipientEmail;

        const baseStyles = {
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: "600",
          userSelect: "none",
          zIndex: "10",
          borderRadius: "4px",
          transition: "all 0.2s ease",
        };

        Object.assign(div.style, baseStyles);

        target.style.position = "relative";
        target.append(div);

        if (isActive) {
          div.addEventListener("click", () => onEdit(sig));
          div.addEventListener("mouseenter", () => {
            if (div && color) {
              div.style.backgroundColor = hexToRgba(color, isSigned ? 0.3 : 0.25);
              div.style.transform = "scale(1.02)";
            }
          });
          div.addEventListener("mouseleave", () => {
            if (div && color) {
              div.style.backgroundColor = hexToRgba(color, isSigned ? 0.2 : 0.15);
              div.style.transform = "scale(1)";
            }
          });
        }
      }

      // Aplicar estilos según el estado y color
      let stateStyles = {};

      if (isActive && color) {
        // Usuario activo con color de la respuesta
        const borderColor = darkenHex(color, 20);
        const bgColor = hexToRgba(color, isSigned ? 0.2 : 0.15);
        const textColor = darkenHex(color, 40);

        stateStyles = {
          cursor: "pointer",
          border: isSigned ? `2px solid ${borderColor}` : `2px dashed ${borderColor}`,
          backgroundColor: bgColor,
          color: textColor,
          opacity: "1",
        };
      } else if (!isActive && color) {
        // Otros usuarios con color de la respuesta pero más tenue
        const borderColor = darkenHex(color, 30);
        const bgColor = hexToRgba(color, 0.1);
        const textColor = darkenHex(color, 50);

        stateStyles = {
          cursor: "default",
          border: isSigned ? `1px solid ${borderColor}` : `1px dashed ${borderColor}`,
          backgroundColor: bgColor,
          color: textColor,
          opacity: "0.7",
        };
      } else {
        // Sin color asignado - usar gris más oscuro
        const grayColor = "#4b5563"; // Gris más oscuro
        const lightGray = "#9ca3af";

        stateStyles = {
          cursor: isActive ? "pointer" : "default",
          border: isSigned
            ? `${isActive ? '2px' : '1px'} solid ${grayColor}`
            : `${isActive ? '2px' : '1px'} dashed ${lightGray}`,
          backgroundColor: isSigned
            ? "rgba(75, 85, 99, 0.1)"
            : "rgba(156, 163, 175, 0.1)",
          color: grayColor,
          opacity: isActive ? "1" : "0.7",
        };
      }

      Object.assign(div.style, stateStyles);

      div.innerHTML = html;
      div.style.width = `${width}px`;
      div.style.height = `${height}px`;
      div.style.left = `${left * target.offsetWidth - width / 2}px`;
      div.style.top = `${top * target.offsetHeight - height / 2}px`;
    });
  }, [signatures, activeRecipientEmail, viewerRef, onEdit]);

  useLayoutEffect(() => {
    retryCountRef.current = 0;

    if (pdfLoad) {
      return;
    }

    requestAnimationFrame(() => {
      renderSignatures();
    });

    const fallbackTimeout = setTimeout(() => {
      renderSignatures();
    }, 200);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [renderSignatures, pdfLoad]);

  useLayoutEffect(() => {
    if (!pdfLoad && signatures.length > 0) {
      const delayedRender = setTimeout(() => {
        renderSignatures();
      }, 100);

      return () => clearTimeout(delayedRender);
    }
  }, [pdfLoad, signatures.length, renderSignatures]);

  return null;
}