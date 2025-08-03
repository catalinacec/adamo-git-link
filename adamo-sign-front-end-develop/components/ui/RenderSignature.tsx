import { Signature } from "@/types";

import React, { forwardRef, useImperativeHandle } from "react";

import { useSignatureData } from "@/context/SignatureContext";

type ReactElement = {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: ReactElement | ReactElement[] | string;
  } & Record<string, unknown>;
};

const RenderSignature = forwardRef((props, ref) => {
  const {
    viewerRef,
    setIsEditingSignature,
    setActiveSignature,
    setTypedSignature,
    signatures,
    activeRecipientEmail,
  } = useSignatureData();

  const showSignature = () => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );

    if (!slides || !signatures) {
      console.log("slide not found");
      return;
    }

    const convertHexToRgba = (hex: string, opacity: number) => {
      if (!hex) return "rgba(0, 0, 0, 0)";
      hex = hex.replace("#", "");
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const renderWithDelay = (
      signature: Signature,
      targetSlide: HTMLElement,
    ) => {
      return new Promise((resolve) => {
        const {
          left,
          top,
          signatureText,
          id,
          recipientEmail,
          signature: signatureContent,
        } = signature;
        const isControllable = recipientEmail === activeRecipientEmail;
        const existingSignature = targetSlide.querySelector(
          `[data-id="${id}"]`,
        ) as HTMLElement;

        const parseReactToHTML = (reactObj: string | ReactElement): string => {
          if (typeof reactObj === "string") return reactObj;

          const { type, props } = reactObj;
          const { style, children, ...otherProps } = props;

          const styleString = style
            ? Object.entries(style)
                .map(
                  ([key, value]) =>
                    `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${value}`,
                )
                .join(";")
            : "";

          const attributes = Object.entries(otherProps || {})
            .map(([key, value]) => {
              if (typeof value === "string" || typeof value === "number") {
                return `${key}="${value}"`;
              }
              return "";
            })
            .filter(Boolean)
            .join(" ");

          const selfClosingTags = ["img", "input", "br", "hr"];
          if (type === "img") {
            const imgStyle = `max-width:100%; max-height:100%; object-fit:contain; ${styleString}`;
            return `<img style="${imgStyle}" ${attributes}/>`;
          }

          if (selfClosingTags.includes(type)) {
            return `<${type} style="${styleString}" ${attributes}/>`;
          }

          const childrenHTML: string = Array.isArray(children)
            ? children.map(parseReactToHTML).join("")
            : children
              ? parseReactToHTML(children)
              : "";

          return `<${type} style="${styleString}" ${attributes}>${childrenHTML}</${type}>`;
        };

        const signatureHTML = signatureContent
          ? parseReactToHTML(signatureContent as ReactElement)
          : "";

        if (existingSignature) {
          existingSignature.innerHTML = signatureContent
            ? signatureHTML
            : signatureText || "Signature";
          existingSignature.style.left = `${left * targetSlide.offsetWidth}px`;
          existingSignature.style.top = `${top * targetSlide.offsetHeight}px`;

          const fontSize =
            signatureContent &&
            typeof signatureContent === "object" &&
            "props" in signatureContent
              ? (signatureContent as ReactElement).props?.style?.fontSize
              : "12";
          existingSignature.style.fontSize = `${fontSize}px`;

          existingSignature.style.backgroundColor = isControllable
            ? convertHexToRgba("#00FF00", 0.2)
            : convertHexToRgba("#99a3a4", 0.1);
          existingSignature.style.border = `2px solid ${convertHexToRgba(
            isControllable ? "#00FF00" : "#99a3a4",
            0.5,
          )}`;
          existingSignature.style.cursor = isControllable
            ? "pointer"
            : "not-allowed";

          return resolve(true);
        }

        const signatureDiv = document.createElement("div");
        signatureDiv.setAttribute("data-id", id);
        signatureDiv.style.position = "absolute";
        signatureDiv.style.width = "180px";
        signatureDiv.style.height = "70px";
        signatureDiv.style.fontSize = "1.5rem";
        signatureDiv.style.backgroundColor = isControllable
          ? convertHexToRgba("#00FF00", 0.2)
          : convertHexToRgba("#99a3a4", 0.1);
        signatureDiv.style.color = "white";
        signatureDiv.style.border = `2px solid ${convertHexToRgba(
          isControllable ? "#00FF00" : "#99a3a4",
          0.5,
        )}`;
        signatureDiv.style.display = "flex";
        signatureDiv.style.justifyContent = "center";
        signatureDiv.style.alignItems = "center";
        signatureDiv.style.borderRadius = "5px";
        signatureDiv.style.cursor = isControllable ? "pointer" : "not-allowed";
        signatureDiv.style.userSelect = "none";

        signatureDiv.innerHTML = signatureContent
          ? signatureHTML
          : signatureText || "Signaturesss";

        signatureDiv.style.left = `${left * targetSlide.offsetWidth}px`;
        signatureDiv.style.top = `${top * targetSlide.offsetHeight}px`;

        const createPopup = () => {
          const popupDiv = document.createElement("div");
          popupDiv.style.position = "absolute";
          popupDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
          popupDiv.style.color = "white";
          popupDiv.style.padding = "10px";
          popupDiv.style.borderRadius = "5px";
          popupDiv.style.textAlign = "center";
          popupDiv.style.zIndex = "1000";
          popupDiv.style.fontSize = "15px";

          const signatureRect = signatureDiv.getBoundingClientRect();
          const slideRect = targetSlide.getBoundingClientRect();

          const signatureTop = signatureRect.top - slideRect.top;
          const signatureLeft = signatureRect.left - slideRect.left;

          const popupHeight = 50;
          const margin = 10;

          if (signatureTop <= popupHeight + margin) {
            popupDiv.style.top = `${signatureTop + signatureRect.height + 10}px`;
          } else {
            popupDiv.style.top = `${signatureTop - popupHeight - margin}px`;
          }
          popupDiv.style.left = `${signatureLeft}px`;

          const editText = document.createElement("span");
          editText.innerText = "Sign";
          editText.style.marginRight = "1vw";
          editText.style.cursor = "pointer";
          editText.onclick = () => {
            setIsEditingSignature(true);
            setActiveSignature(signature);
            setTypedSignature(signature.signatureText || "");

            popupDiv.style.display = "none";
          };

          const closeText = document.createElement("span");
          closeText.innerText = "X";
          closeText.style.cursor = "pointer";
          closeText.onclick = () => {
            popupDiv.style.display = "none";
          };

          popupDiv.appendChild(editText);
          popupDiv.appendChild(closeText);

          return popupDiv;
        };

        let popup = null as HTMLElement | null;

        if (isControllable) {
          signatureDiv.addEventListener("click", (e) => {
            e.stopPropagation();

            if (popup && popup.style.display !== "none") {
              popup.style.display = "none";
            } else {
              popup = createPopup();
              targetSlide.appendChild(popup);
            }
          });
        }

        targetSlide.appendChild(signatureDiv);
        resolve(true);
      });
    };

    const renderSignaturesWithDelay = async () => {
      for (const signature of signatures) {
        const targetSlide = slides[signature.slideIndex];
        if (targetSlide) {
          await renderWithDelay(signature, targetSlide);
        }
      }
    };

    renderSignaturesWithDelay();
  };

  useImperativeHandle(ref, () => ({
    showSignature,
  }));

  return <></>;
});

RenderSignature.displayName = "RenderSignature";

export default RenderSignature;
