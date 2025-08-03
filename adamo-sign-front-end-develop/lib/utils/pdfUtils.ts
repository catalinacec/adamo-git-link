import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';
import { isValidElement } from 'react';
import { Signature } from "@/types";

  type ProcessPDFProps = {
    file?: File | null;
    pdfLink?: string;
    signatures: Signature[];
    fontUrls: Record<string, string>;
    fetchFontBytes: (url: string) => Promise<Uint8Array>;
    viewerRef: React.RefObject<HTMLDivElement>;
  };

export const processPDFWithSignatures = async ({
  file,
  pdfLink,
  signatures,
  fontUrls,
  fetchFontBytes,
  viewerRef,
}: ProcessPDFProps): Promise<Uint8Array> => {
  let pdfDoc: PDFDocument;
      let pdfBytes: ArrayBuffer | undefined;
  
      // Load PDF document
      if (file && typeof file?.type === "string" && file?.type.startsWith("image/")) {
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFDocument.create();
  
        let embeddedImage;
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === "image/png") {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer);
        } else {
          throw new Error(
            "Unsupported image format. Only JPG and PNG are supported.",
          );
        }
  
        const page = pdfDoc.addPage();
        const { width, height } = embeddedImage;
        page.setSize(width, height);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      } else if (pdfLink && pdfLink !== 'null') {
        try {
          const response = await fetch(pdfLink);
          if (!response.ok) {
            throw new Error("Failed to fetch PDF content from the provided URL.");
          }
          pdfBytes = await response.arrayBuffer();
          pdfDoc = await PDFDocument.load(pdfBytes);
        } catch (error) {
          console.error("Error fetching PDF from pdfLink:", error);
          throw new Error("Failed to load PDF from pdfLink.");
        }
      } else if (file) {
        try {
          pdfBytes = await file.arrayBuffer();
          pdfDoc = await PDFDocument.load(pdfBytes);
        } catch (error) {
          console.error("Error loading file:", error);
          throw new Error("Failed to load PDF from file.");
        }
      } else {
        console.error("No valid input provided for PDF generation.");
        throw new Error("No valid input provided for PDF generation.");
      }
  
      pdfDoc.registerFontkit(fontkit);
  
      // Process signatures
      for (let i = 0; i < signatures.length; i++) {
        const signature = signatures[i];
        if (signature.signatureIsEdit) {
          try {
            const {
              slideIndex,
              left,
              top,
              signature: signatureValue,
            } = signature;
            const page = pdfDoc.getPage(slideIndex);
            const slides =
              viewerRef.current?.querySelectorAll(
                ".pdf-slide, .docx-slide, .image-slide",
              ) ?? [];
            const slideElement = slides[slideIndex] as unknown as {
              offsetWidth: number;
              offsetHeight: number;
            };
  
            if (!slideElement) {
              throw new Error("Slide not found for the given index.");
            }
  
            const { width: pdfWidth, height: pdfHeight } = page.getSize();
            const slideWidth = slideElement.offsetWidth;
            const slideHeight = slideElement.offsetHeight;
  
            const scaleX = pdfWidth / slideWidth;
            const scaleY = pdfHeight / slideHeight;
  
            const boxWidthPx = 180;
            const boxHeightPx = 70;
  
            const boxX = left * slideWidth * scaleX;
            const boxY =
              pdfHeight - top * slideHeight * scaleY - boxHeightPx * scaleY;
  
            if (
              isValidElement(signatureValue) &&
              signatureValue.type === "span"
            ) {
              const text = (signatureValue.props.children as string) || "";
              const style = signatureValue.props.style || {};
              const color = style.color || "#000000";
              const font = parseFloat(style.fontSize) || 13;
              const fontFamily = style.fontFamily || "MadreScript";
  
              const fontUrl = fontUrls[fontFamily] || fontUrls["MadreScript"];
              const customFontBytes = await fetchFontBytes(fontUrl);
              const customFont = await pdfDoc.embedFont(customFontBytes);
  
              const hexToRgb = (hex: string) => {
                const bigint = parseInt(hex.slice(1), 16);
                return {
                  r: ((bigint >> 16) & 255) / 255,
                  g: ((bigint >> 8) & 255) / 255,
                  b: (bigint & 255) / 255,
                };
              };
  
              const { r, g, b } = hexToRgb(color);
  
              const textSize = font;
              const textWidth =
                customFont.widthOfTextAtSize(text, textSize) * scaleX;
              const textHeight = customFont.heightAtSize(textSize) * scaleY;
  
              const textX = boxX + (boxWidthPx * scaleX - textWidth) / 2;
              const textY = boxY + (boxHeightPx * scaleY - textHeight) / 2;
  
              page.drawText(text, {
                x: textX,
                y: textY,
                size: textSize * scaleX,
                font: customFont,
                color: rgb(r, g, b),
              });
            } else if (
              isValidElement(signatureValue) &&
              signatureValue.type === "img"
            ) {
              const imageUrl = (signatureValue.props as { src: string }).src;
              if (!imageUrl) {
                throw new Error("Image URL is missing.");
              }
  
              let embedImageFunction;
              if (
                imageUrl.includes("data:image/jpeg") ||
                imageUrl.includes("data:image/jpg")
              ) {
                embedImageFunction = pdfDoc.embedJpg.bind(pdfDoc);
              } else if (imageUrl.includes("data:image/png")) {
                embedImageFunction = pdfDoc.embedPng.bind(pdfDoc);
              } else {
                throw new Error("Unsupported image format");
              }
  
              const base64Data = imageUrl.split(",")[1];
              const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
                c.charCodeAt(0),
              );
              const embeddedImage = await embedImageFunction(imageBytes);
  
              const scaleFactor = Math.min(
                (boxWidthPx * scaleX) / embeddedImage.width,
                (boxHeightPx * scaleY) / embeddedImage.height,
              );
  
              const imageWidth = embeddedImage.width * scaleFactor;
              const imageHeight = embeddedImage.height * scaleFactor;
  
              page.drawImage(embeddedImage, {
                x: boxX + (boxWidthPx * scaleX - imageWidth) / 2,
                y: boxY + (boxHeightPx * scaleY - imageHeight) / 2,
                width: imageWidth,
                height: imageHeight,
              });
            }
  
            signatures.splice(i, 1);
            i--;
          } catch (embedError) {
            console.error("Error embedding signature:", embedError);
          }
        }
      }
  
      return await pdfDoc.save();
};