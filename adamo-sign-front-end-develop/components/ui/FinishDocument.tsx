import React, { forwardRef, useImperativeHandle } from "react";
import * as fontkit from "fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import AWS from "aws-sdk";
import { useSignatureData } from "@/context/SignatureContext";
import { useRouter } from "next/navigation";

type FontUrls = {
  [key: string]: string;
};

type Signature = {
  slideIndex: number;
  left: number;
  top: number;
  width: number;
  height: number;
  signature: React.ReactNode;
  signatureIsEdit?: boolean;
};

type HandleFinishDocumentProps = {
  pdfLink: string;
  signatures: Signature[];
  queryPdfUrl: string;
};

const FinishDocument = forwardRef<{
  handleFinishDocument: (args: { pdfLink: string, signatures: any[], queryPdfUrl: string }) => void;
}, unknown>((props, ref) => {
  const { viewerRef, setLoading } = useSignatureData();
  const router = useRouter();

  const fontUrls: FontUrls = {
    Helvetica: "https://fonts.cdnfonts.com/css/helvetica-neue-55",
    "FF Market": "https://db.onlinewebfonts.com/t/cbf4e1e19572ee20b952fd42eca5d2bf.ttf",
    MadreScript: "https://db.onlinewebfonts.com/t/078dccb5f3be0956233a6975ccbf4975.ttf",
    "Dancing Script": "https://db.onlinewebfonts.com/t/be7d00cc3e81bca7bd01f0924f5d5b73.ttf",
    "Great Vibes": "https://db.onlinewebfonts.com/t/5bf06596a053153248631d74f9fc4e28.ttf",
    Pacifico: "https://db.onlinewebfonts.com/t/6b6170fe52fb23f505b4e056fefd2679.ttf",
    Satisfy: "https://db.onlinewebfonts.com/t/4b6d03ce5461faeda7d8e785d1a2351a.ttf",
  };

  const fetchFontBytes = async (fontUrl: string): Promise<ArrayBuffer> => {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to load font from ${fontUrl}`);
    }
    return await response.arrayBuffer();
  };

  const updateAdminDetails = async ({
    adminDetailsUrl,
    queryPdfUrl,
    emailPdfUrl,
  }: {
    adminDetailsUrl: string;
    queryPdfUrl: string;
    emailPdfUrl: string;
  }): Promise<void> => {
    try {
      const response = await fetch(adminDetailsUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch Admin Detail JSON.");
      }
      const adminDetails: any[] = await response.json();
      const matchingEntry = adminDetails.find(
        (entry) => entry.tokenOfQuery === queryPdfUrl
      );
      if (!matchingEntry) {
        console.error("Token not found in Admin Detail JSON.");
        return;
      }

      matchingEntry.adminCheck = "success";
      matchingEntry.emailPdfUrl = emailPdfUrl;

      const updatedAdminDetails = JSON.stringify(adminDetails, null, 2);

      const s3 = new AWS.S3({
        accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
        region: process.env.NEXT_PUBLIC_REGION!,
      });

      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.NEXT_PUBLIC_BUCKETNAME!,
        Key: "Admin/AdminDetail.json",
        Body: updatedAdminDetails,
        ContentType: "application/json",
        ACL: "public-read",
      };

      await s3.upload(params).promise();
    } catch (error) {
      console.error("Error updating Admin Detail JSON:", error);
    }
  };

  const updateUserDataFile = async (
    bucketUrl: string,
    queryPdfUrl: string,
    emailPdfUrl: string
  ): Promise<void> => {
    const url = `${bucketUrl}/User Data/${queryPdfUrl}.json`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch user data JSON file.");
      }

      const jsonData: any = await response.json();

      jsonData.emailPdfUrl = emailPdfUrl;

      const updatedJsonString = JSON.stringify(jsonData);

      const s3 = new AWS.S3({
        accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
        region: process.env.NEXT_PUBLIC_REGION!,
      });

      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.NEXT_PUBLIC_BUCKETNAME!,
        Key: `User Data/${queryPdfUrl}.json`,
        Body: updatedJsonString,
        ContentType: "application/json",
        ACL: "public-read",
      };

      await s3.upload(params).promise();
    } catch (error) {
      console.error("Error updating user data JSON file:", error);
      throw new Error("Failed to update user data file.");
    }
  };

  const handleFinishDocument = async ({
    pdfLink,
    signatures,
    queryPdfUrl,
  }: HandleFinishDocumentProps): Promise<void> => {
    if (!signatures || (Array.isArray(signatures) && signatures.length === 0)) {
      alert("Please add a Signature");
      return;
    }

    try {
      const s3 = new AWS.S3({
        accessKeyId: process.env.NEXT_PUBLIC_ACCESSKEYID!,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRETACCESSKEY!,
        region: process.env.NEXT_PUBLIC_REGION!,
      });

      setLoading(true);

      const response = await fetch(pdfLink);
      if (!response.ok) {
        throw new Error("Failed to fetch PDF content from the provided URL.");
      }
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit as any);  // Use 'any' to bypass type check

      for (let i = 0; i < signatures.length; i++) {
        const signature = signatures[i];
        if (signature.signatureIsEdit) {
          try {
            const { slideIndex, left, top, width: signatureWidth, height: signatureHeight, signature: signatureValue } = signature;

            const page = pdfDoc.getPage(slideIndex);

            const slides = viewerRef.current.querySelectorAll(".pdf-slide, .docx-slide, .image-slide");
            const slideElement = slides[slideIndex];
            if (!slideElement) {
              console.error("Slide not found for index:", slideIndex);
              continue;
            }

            const { width: pdfWidth, height: pdfHeight } = page.getSize();

            const slideWidth = slideElement.offsetWidth;
            const slideHeight = slideElement.offsetHeight;

            const scaleX = pdfWidth / slideWidth;
            const scaleY = pdfHeight / slideHeight;

            const boxWidthPx = signatureWidth || 188;
            const boxHeightPx = signatureHeight || 80;

            const boxX = left * slideWidth * scaleX - (boxWidthPx * scaleX) / 2;
            const boxY = pdfHeight - (top * slideHeight * scaleY) - (boxHeightPx * scaleY) / 2;

            if (React.isValidElement(signatureValue) && signatureValue.type === "span") {
              const text = signatureValue.props.children || "";
              const style = signatureValue.props.style || {};

              const color = style.color || "#000000";
              const baseFontSize = parseFloat(style.fontSize) || 13;
              const fontFamily = style.fontFamily || "Helvetica";

              const fontUrl = fontUrls[fontFamily] || fontUrls["Helvetica"];
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

              const textSize = baseFontSize * Math.min(scaleX, scaleY);
              const textWidth = customFont.widthOfTextAtSize(text, textSize);
              const textHeight = customFont.heightAtSize(textSize);

              const centeredX = boxX + (boxWidthPx * scaleX - textWidth) / 2;
              const centeredY = boxY + (boxHeightPx * scaleY - textHeight) / 2;

              page.drawText(text, {
                x: centeredX,
                y: centeredY,
                size: textSize,
                font: customFont,
                color: rgb(r, g, b),
              });
            } else if (React.isValidElement(signatureValue) && signatureValue.type === "img") {
              const imageUrl = (signatureValue as React.ReactElement).props.src;
              if (!imageUrl) {
                console.error("Image URL is missing.");
                continue;
              }

              let embedImageFunction;
              if (imageUrl.includes("data:image/jpeg") || imageUrl.includes("data:image/jpg")) {
                embedImageFunction = pdfDoc.embedJpg.bind(pdfDoc);
              } else if (imageUrl.includes("data:image/png")) {
                embedImageFunction = pdfDoc.embedPng.bind(pdfDoc);
              } else {
                console.error("Unsupported image format");
                continue;
              }

              const base64Data = imageUrl.split(",")[1];
              const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
              const embeddedImage = await embedImageFunction(imageBytes);

              const scaleFactor = Math.min(
                (boxWidthPx * scaleX) / embeddedImage.width,
                (boxHeightPx * scaleY) / embeddedImage.height
              );

              const imageWidth = embeddedImage.width * scaleFactor;
              const imageHeight = embeddedImage.height * scaleFactor;

              const imageX = boxX + (boxWidthPx * scaleX - imageWidth) / 2;
              const imageY = boxY + (boxHeightPx * scaleY - imageHeight) / 2;

              page.drawImage(embeddedImage, {
                x: imageX,
                y: imageY,
                width: imageWidth,
                height: imageHeight,
              });
            }

          } catch (embedError) {
            console.error("Error embedding signature:", embedError);
          }

        }

        const progressPercentage = ((i + 1) / signatures.length) * 70 + 10;
        console.log("progressPercentage", progressPercentage)
      }

      const modifiedPdfBytes = await pdfDoc.save();

      const params: AWS.S3.PutObjectRequest = {
        Bucket: process.env.NEXT_PUBLIC_BUCKETNAME!,
        Key: `uploaded-files/${Date.now()}.pdf`,
        Body: modifiedPdfBytes,
        ContentType: "application/pdf",
        ACL: "public-read",
      };

      const uploadResult = await s3
        .upload(params)
        .on("httpUploadProgress", (progressData) => {
          const percentage = Math.round(
            (progressData.loaded / progressData.total) * 100
          );
          console.log("percentage", percentage);
        })
        .promise();

      const emailPdfUrl = uploadResult.Location;

      await updateUserDataFile(
        `${process.env.NEXT_PUBLIC_S3_BUCKETURL!}`,
        queryPdfUrl,
        emailPdfUrl
      );

      await updateAdminDetails({
        adminDetailsUrl: `${process.env.NEXT_PUBLIC_S3_BUCKETURL!}/Admin/AdminDetail.json`,
        queryPdfUrl,
        emailPdfUrl,
      });

      setLoading(false);
      router.push("https://dev-sign.adamoservices.co/documents/list");
    } catch (error) {
      console.error("Error exporting file:", error);
      setLoading(false);
      alert("Failed to upload file.");
    }
  };

  useImperativeHandle(ref, () => ({
    handleFinishDocument,
  }));

  return <></>;
});

FinishDocument.displayName = "FinishDocument";

export default FinishDocument;
