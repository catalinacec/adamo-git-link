"use client";

import { useOnClickOutside } from "usehooks-ts";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { useSignatureData } from "@/context/SignatureContext";

import {
  CloseIcon,
  CopyIcon,
  SignatureIcon,
  UpdateIcon,
  ZoomIcon,
} from "../icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip";

interface ISignSignature {
  id: string;
  top: number;
  left: number;
  color: string;
  sign: Array<{
    id: string;
    color: string;
    selectedRecipientName: string;
    selectedRecipientEmail: string;
  }>;
  currentSlideIndex: number;
  slideElement: HTMLElement | null;
  viewerRef: React.MutableRefObject<any>;
}

const SignSignature = ({
  color,
  slideElement,
  viewerRef,
  currentSlideIndex,
  top,
  left,
  id,
  sign,
}: ISignSignature) => {
  const { setSignatures } = useSignatureData();
  const [isFocus, setIsFocus] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("SignItem");
  const [dragging, setDragging] = useState(false);

  const [position, setPosition] = useState({
    left,
    top,
  });

  const copySignature = () => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    if (slides.length === 0) {
      alert("No slides available to add a signature!");
      return;
    }

    const getSignature = sign.find((sig) => sig.id === id);
    const colorCode = getSignature ? getSignature.color : null;

    const signatureSlideIndex = currentSlideIndex;

    const currentSlide = slides[signatureSlideIndex];
    const slideWidth = currentSlide.offsetWidth;
    const slideHeight = currentSlide.offsetHeight;

    const containerScrollTop = viewerRef.current.scrollTop;
    const containerScrollLeft = viewerRef.current.scrollLeft;

    const slideTopInContainer = currentSlide.offsetTop;
    const slideLeftInContainer = currentSlide.offsetLeft;

    const visibleSlideTop = Math.max(slideTopInContainer, containerScrollTop);
    const visibleSlideBottom = Math.min(
      slideTopInContainer + slideHeight,
      containerScrollTop + viewerRef.current.offsetHeight,
    );
    const visibleSlideLeft = Math.max(
      slideLeftInContainer,
      containerScrollLeft,
    );
    const visibleSlideRight = Math.min(
      slideLeftInContainer + slideWidth,
      containerScrollLeft + viewerRef.current.offsetWidth,
    );

    const visibleWidth = visibleSlideRight - visibleSlideLeft;
    const visibleHeight = visibleSlideBottom - visibleSlideTop;

    if (visibleWidth <= 0 || visibleHeight <= 0) {
      alert("The current slide is not visible in the viewport!");
      return;
    }

    const centerX = visibleSlideLeft + visibleWidth / 2 - slideLeftInContainer;
    const centerY = visibleSlideTop + visibleHeight / 2 - slideTopInContainer;

    const randomOffsetX = (Math.random() - 0.5) * (visibleWidth / 2);
    const randomOffsetY = (Math.random() - 0.5) * (visibleHeight / 2);

    const randomLeft = centerX + randomOffsetX;
    const randomTop = centerY + randomOffsetY;

    const signature = {
      id: crypto.randomUUID(),
      left: randomLeft / slideWidth,
      top: randomTop / slideHeight,
      slideIndex: signatureSlideIndex,
      signatureText: "Signature",
      recipientsName: getSignature?.selectedRecipientName,
      recipientEmail: getSignature?.selectedRecipientEmail,
      signatureContentFixed: true,
      signatureIsEdit: false,
      slideElement: currentSlide,
      color: colorCode,
      width: 136,
      height: 80,
    };

    setSignatures((prevSignatures) => [
      ...prevSignatures,
      {
        ...signature,
        color: signature.color ?? "#94F2F2",
        recipientEmail: String(signature.recipientEmail),
        recipientsName: String(signature.recipientsName),
      },
    ]);
  };

  const handleDeleteSignature = () => {
    setSignatures((prevSignatures) => {
      const updatedSignatures = prevSignatures.filter(
        (signature) => signature.id !== id,
      );

      if (ref.current) {
        const parentNode = ref.current.parentNode;

        if (parentNode) {
          try {
            parentNode.removeChild(ref.current);
          } catch (error) {
            console.warn("Failed to remove child node:", error);
            console.log("Parent node:", parentNode);
            console.log("Current node:", ref.current);
          }
        } else {
          console.warn("Parent node is null or undefined.");
        }
      }

      return updatedSignatures;
    });
  };

  useOnClickOutside(ref, () => setIsFocus(false));

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !slideElement) return;

    const slideRect = slideElement.getBoundingClientRect();
    const newLeft = Math.min(
      Math.max((e.clientX - slideRect.left) / slideRect.width, 0),
      1,
    );
    const newTop = Math.min(
      Math.max((e.clientY - slideRect.top) / slideRect.height, 0),
      1,
    );

    const elementWidth = Number(ref.current?.offsetWidth) / slideRect.width;
    const elementHeight = Number(ref.current?.offsetHeight) / slideRect.height;

    const clampedLeft = Math.min(
      Math.max(newLeft, 0 + elementWidth / 2),
      1 - elementWidth / 2,
    );
    const clampedTop = Math.min(
      Math.max(newTop, 0 + elementHeight / 2),
      1 - elementHeight / 2,
    );

    setPosition({ left: clampedLeft, top: clampedTop });
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);

      setSignatures((prevSignatures) =>
        prevSignatures.map((signature) =>
          signature.id === ref.current?.dataset.id
            ? { ...signature, left: position.left, top: position.top }
            : signature,
        ),
      );
    }
  };

  const resizeSignature = () => {};

  const rotateSignature = () => {};

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  useEffect(() => {
    const signatureElement = ref.current;
    if (signatureElement && slideElement) {
      slideElement.appendChild(signatureElement);
    }
  }, [slideElement, sign]);

  return (
    <div
      className="relative inline-block"
      style={{
        position: "absolute",
        top: `${position.top * 100}%`,
        left: `${position.left * 100}%`,
        transform: "translate(-50%, -50%)",
        cursor: dragging ? "grabbing" : "grab",
      }}
      ref={ref}
      onMouseDown={handleMouseDown}
    >
      <div className="relative inline-block">
        {isFocus && (
          <div className="flex absolute justify-between -top-8 inset-x-0 w-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleDeleteSignature}
                  className="bg-neutral-100 rounded-md p-1"
                >
                  <CloseIcon color="black" size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("removeSignature")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={copySignature}
                  className="bg-neutral-100 rounded-md p-1"
                >
                  <CopyIcon color="black" size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("copySignature")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={resizeSignature}
                  className="bg-neutral-100 rounded-md p-1"
                >
                  <UpdateIcon color="black" size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("updateSignature")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={rotateSignature}
                  className="bg-neutral-100 rounded-md p-1"
                >
                  <ZoomIcon color="black" size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("zoomSignature")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        <div
          className={`h-[80px] w-[130px] border inline-flex gap-x-2 items-center justify-center cursor-pointer ${
            isFocus ? "border-dashed border-neutral-600" : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => setIsFocus(true)}
        >
          <SignatureIcon color="black" />
          <span className="text-xs font-semibold text-black">{t("sign")}</span>
        </div>
      </div>
    </div>
  );
};

export default SignSignature;
