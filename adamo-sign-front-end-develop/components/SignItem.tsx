import { PositionStyle } from "@/types";
import { useOnClickOutside } from "usehooks-ts";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { useSignatureData } from "@/context/SignatureContext";

import { SignDocumentModal } from "./Modals/SignDocumentModal";
import {
  CloseIcon,
  CopyIcon,
  SignatureIcon,
  UpdateIcon,
  ZoomIcon,
} from "./icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/Tooltip";

interface SignItemProps {
  color: string;
  className?: string;
  slideElement: HTMLElement | null;
  viewerRef: React.RefObject<HTMLElement>;
  positionStyle?: PositionStyle;
  setSignatures: React.Dispatch<React.SetStateAction<Signature[]>>;
  currentSlideIndex: number;
  top: number;
  left: number;
  height: number;
  width: number;
  id: string;
  sign: any;
  slideIndex: number;
}

interface Signature {
  id: string;
  left: number;
  top: number;
  slideIndex: number;
  signatureText: string;
  recipientsName: string;
  recipientEmail: string;
  signatureContentFixed: boolean;
  signatureIsEdit: boolean;
  color?: string;
  width?: number;
  height?: number;
  rotation?: number;
  slideElement?: HTMLElement;
  signatureDelete?: boolean;
}

function SignItem({
  color,
  slideElement,
  viewerRef,
  setSignatures,
  currentSlideIndex,
  top,
  left,
  height,
  width,
  id,
  sign,
}: SignItemProps) {
  const [isFocus, setIsFocus] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [size, setSize] = useState({ width, height });
  const [focusPosition, setFocusPosition] = useState<"top" | "bottom">("top");
  const [, setResizing] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("SignItem");
  const [isResizingActive, setIsResizingActive] = useState(false);
  const {
    tokenOfQuery,
    setIsEditingSignature,
    isEditingSignature,
    setActiveSignature,
    setActiveUserOfQuery,
    setTypedSignature,
  } = useSignatureData();
  useOnClickOutside(ref, () => setIsFocus(false));
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialWidth = size.width;
    const initialHeight = size.height;

    const handleResizeMouseMove = (moveEvent: MouseEvent) => {
      if (!slideElement || !ref.current) return;

      const slideRect = slideElement.getBoundingClientRect();
      const signatureRect = ref.current.getBoundingClientRect();

      const deltaX = moveEvent.clientX - initialMouseX;
      const deltaY = moveEvent.clientY - initialMouseY;

      let newWidth = initialWidth + deltaX;
      let newHeight = initialHeight + deltaY;

      const newRight = signatureRect.left + newWidth;
      const newBottom = signatureRect.top + newHeight;

      const isTouchingRight = newRight >= slideRect.right;
      const isTouchingLeft = signatureRect.left <= slideRect.left;
      const isTouchingBottom = newBottom >= slideRect.bottom;
      const isTouchingTop = signatureRect.top <= slideRect.top;

      if (isTouchingRight)
        newWidth = Math.min(
          initialWidth + deltaX,
          slideRect.right - signatureRect.left,
        );
      if (isTouchingLeft)
        newWidth = Math.min(
          initialWidth + deltaX,
          signatureRect.right - slideRect.left,
        );
      if (isTouchingBottom)
        newHeight = Math.min(
          initialHeight + deltaY,
          slideRect.bottom - signatureRect.top,
        );
      if (isTouchingTop)
        newHeight = Math.min(
          initialHeight + deltaY,
          signatureRect.bottom - slideRect.top,
        );

      newWidth = Math.max(30, newWidth);
      newHeight = Math.max(30, newHeight);

      setSize({ width: newWidth, height: newHeight });

      setSignatures((prevSignatures) =>
        prevSignatures.map((signature) =>
          signature.id === id
            ? { ...signature, width: newWidth, height: newHeight }
            : signature,
        ),
      );
    };

    const handleResizeMouseUp = () => {
      setResizing(false);
      document.removeEventListener("mousemove", handleResizeMouseMove);
      document.removeEventListener("mouseup", handleResizeMouseUp);
    };

    document.addEventListener("mousemove", handleResizeMouseMove);
    document.addEventListener("mouseup", handleResizeMouseUp);
  };

  const copySignature = () => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    if (!slides?.length) {
      alert("No slides available to add a signature!");
      return;
    }

    const colorCode = sign.color;
    const signatureSlideIndex = currentSlideIndex;
    const currentSlide = slides?.[signatureSlideIndex] as HTMLElement;
    const slideWidth = currentSlide.offsetWidth;
    const slideHeight = currentSlide.offsetHeight;

    const containerScrollTop = viewerRef.current?.scrollTop || 0;
    const containerScrollLeft = viewerRef.current?.scrollLeft || 0;

    const slideTopInContainer = currentSlide.offsetTop;
    const slideLeftInContainer = currentSlide.offsetLeft;

    const visibleSlideTop = Math.max(slideTopInContainer, containerScrollTop);
    const visibleSlideBottom = Math.min(
      slideTopInContainer + slideHeight,
      containerScrollTop + Number(viewerRef?.current?.offsetHeight),
    );
    const visibleSlideLeft = Math.max(
      slideLeftInContainer,
      containerScrollLeft,
    );
    const visibleSlideRight = Math.min(
      slideLeftInContainer + slideWidth,
      containerScrollLeft + Number(viewerRef?.current?.offsetWidth),
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

    const signature: Signature = {
      id: crypto.randomUUID(),
      left: randomLeft / slideWidth,
      top: randomTop / slideHeight,
      slideIndex: signatureSlideIndex,
      signatureText: "Signature",
      recipientsName: sign.recipientsName,
      recipientEmail: sign.recipientEmail,
      signatureContentFixed: true,
      signatureIsEdit: false,
      slideElement: currentSlide,
      color: colorCode || "",
      signatureDelete: false,
      width: size.width,
      height: size.height,
      rotation: sign.rotation,
    };

    setSignatures((prevSignatures) => [...prevSignatures, signature]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;

    let initialSlideIndex = currentSlideIndex;
    let initialLeft = left;
    let initialTop = top;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const slides = viewerRef.current?.querySelectorAll(
        ".pdf-slide, .image-slide",
      );
      let newSlideIndex = currentSlideIndex;
      let currentSlide = slides?.[currentSlideIndex] as HTMLElement;

      slides?.forEach((slide, index) => {
        const slideRect = slide.getBoundingClientRect();
        if (
          moveEvent.clientX >= slideRect.left &&
          moveEvent.clientX <= slideRect.right &&
          moveEvent.clientY >= slideRect.top &&
          moveEvent.clientY <= slideRect.bottom
        ) {
          newSlideIndex = index;
          currentSlide = slide as HTMLElement;
        }
      });

      if (newSlideIndex !== initialSlideIndex) {
        const previousSlide = slides?.[initialSlideIndex] as HTMLElement;
        const previousSlideRect = previousSlide.getBoundingClientRect();
        const newSlideRect = currentSlide.getBoundingClientRect();

        initialLeft =
          (initialLeft * previousSlideRect.width +
            (previousSlideRect.left - newSlideRect.left)) /
          newSlideRect.width;
        initialTop = (initialMouseY - newSlideRect.top) / newSlideRect.height;

        initialSlideIndex = newSlideIndex;
      }

      const slideRect = currentSlide.getBoundingClientRect();
      const deltaX = moveEvent.clientX - initialMouseX;
      const deltaY = moveEvent.clientY - initialMouseY;

      let newLeft = (initialLeft * slideRect.width + deltaX) / slideRect.width;
      let newTop = (initialTop * slideRect.height + deltaY) / slideRect.height;

      const rotatedWidth = rotation % 180 === 0 ? size.width : size.height;
      const rotatedHeight = rotation % 180 === 0 ? size.height : size.width;

      const halfRotatedWidth = rotatedWidth / (2 * slideRect.width);
      const halfRotatedHeight = rotatedHeight / (2 * slideRect.height);

      newLeft = Math.min(
        Math.max(newLeft, halfRotatedWidth),
        1 - halfRotatedWidth,
      );
      newTop = Math.min(
        Math.max(newTop, halfRotatedHeight),
        1 - halfRotatedHeight,
      );

      setSignatures((prevSignatures) =>
        prevSignatures.map((signature) =>
          signature.id === id
            ? {
                ...signature,
                slideIndex: newSlideIndex,
                slideElement: currentSlide,
                left: newLeft,
                top: newTop,
              }
            : signature,
        ),
      );
    };

    const handleMouseUp = () => {
      setDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const rotateSignature = () => {
    const updatedRotation = (rotation + 90) % 360;
    setRotation(updatedRotation);

    setSignatures((prevSignatures) =>
      prevSignatures.map((signature) => {
        if (signature.id === id) {
          const slideRect = slideElement?.getBoundingClientRect();
          if (!slideRect) return signature;

          const rotatedWidth =
            updatedRotation % 180 === 0 ? size.width : size.height;
          const rotatedHeight =
            updatedRotation % 180 === 0 ? size.height : size.width;

          const halfRotatedWidth = rotatedWidth / (2 * slideRect.width);
          const halfRotatedHeight = rotatedHeight / (2 * slideRect.height);

          const newLeft = Math.min(
            Math.max(signature.left, halfRotatedWidth),
            1 - halfRotatedWidth,
          );
          const newTop = Math.min(
            Math.max(signature.top, halfRotatedHeight),
            1 - halfRotatedHeight,
          );

          return {
            ...signature,
            left: newLeft,
            top: newTop,
            rotation: updatedRotation,
          };
        }
        return signature;
      }),
    );
  };

  const handleDeleteSignature = () => {
    const signatureElement = ref.current;

    const currentSlide = slideElement;
    if (
      signatureElement &&
      currentSlide &&
      currentSlide.contains(signatureElement)
    ) {
      currentSlide.removeChild(signatureElement);
    }

    setSignatures((prevSignatures) =>
      prevSignatures.map((signature) =>
        signature.id === id
          ? { ...signature, signatureDelete: true }
          : signature,
      ),
    );
  };

  const handleFocusPosition = () => {
    if (!ref.current || !slideElement) return;

    const signatureRect = ref.current.getBoundingClientRect();
    const slideRect = slideElement.getBoundingClientRect();

    if (rotation === 90) {
      if (signatureRect.left - slideRect.left < 50) {
        setFocusPosition("bottom");
      } else {
        setFocusPosition("top");
      }
    } else {
      if (signatureRect.top - slideRect.top < 50) {
        setFocusPosition("top");
      } else {
        setFocusPosition("bottom");
      }
    }
  };

  const handleOpenSignInModal = () => {
    setIsEditingSignature(true);
    setActiveSignature(sign);
    setTypedSignature("Admin");
    setActiveUserOfQuery("Admin");
  };

  useEffect(() => {
    if (isFocus) {
      handleFocusPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocus, rotation, top, left, slideElement]);

  useEffect(() => {
    const signatureElement = ref.current;
    if (signatureElement && slideElement) {
      slideElement.appendChild(signatureElement);
    }

    return () => {
      if (
        signatureElement &&
        slideElement &&
        slideElement.contains(signatureElement)
      ) {
        slideElement.removeChild(signatureElement);
      }
    };
  }, [slideElement, id]);

  // ***************************************************************************
  // ************************** TEST ALVARO ************************************
  // ***************************************************************************

  // dentro de tu función SignItem, después de tus hooks (useState, refs, …)
  useEffect(() => {
    if (!slideElement) {
      console.warn(`[SignItem ${id}] no hay slideElement asignado`);
      return;
    }

    const slideRect = slideElement.getBoundingClientRect();
    const absLeftPx = left * slideRect.width;
    const absTopPx = top * slideRect.height;
    const absWidthPx = width * slideRect.width;
    const absHeightPx = height * slideRect.height;

    console.group(`🔖 SignItem "${id}"`);
    // console.log("→ Slide index:", slideIndex);
    console.log("→ Slide DOM rect:", {
      left: slideRect.left.toFixed(0),
      top: slideRect.top.toFixed(0),
      width: slideRect.width.toFixed(0),
      height: slideRect.height.toFixed(0),
    });
    console.log("→ Normalized coords (0–1):", {
      top: top.toFixed(4),
      left: left.toFixed(4),
    });
    console.log("→ Absolute px within slide:", {
      x: `${absLeftPx.toFixed(2)}px`,
      y: `${absTopPx.toFixed(2)}px`,
      width: `${absWidthPx.toFixed(2)}px`,
      height: `${absHeightPx.toFixed(2)}px`,
    });
    console.groupEnd();
  }, [slideElement, top, left, width, height, id]);

  return (
    <>
      <div
        className="relative inline-block"
        style={{
          position: "absolute",
          top: `${top * 100}%`,
          left: `${left * 100}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          cursor: dragging ? "grabbing" : "grab",
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
        ref={ref}
        onMouseDown={handleMouseDown}
        data-recipient-email={sign.recipientEmail}
      >
        <div className="relative inline-block">
          {isFocus && (
            <div
              className={`flex absolute justify-between inset-x-0 w-full`}
              style={{
                [focusPosition === "top" ? "bottom" : "top"]: "-40px",
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDeleteSignature}
                    type="button"
                    className="bg-neutral-100 rounded-md p-1"
                  >
                    <CloseIcon color="black" size={20} />
                  </button>
                </TooltipTrigger>
                {rotation === 0 && (
                  <TooltipContent>
                    <p>Remove</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={rotateSignature}
                    className="bg-neutral-100 rounded-md p-1"
                  >
                    <UpdateIcon color="black" size={20} />
                  </button>
                </TooltipTrigger>
                {rotation === 0 && (
                  <TooltipContent>
                    <p>Rotate</p>
                  </TooltipContent>
                )}
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
                {rotation === 0 && (
                  <TooltipContent>
                    <p>Duplicate</p>
                  </TooltipContent>
                )}
              </Tooltip>

              {rotation === 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="bg-neutral-100 rounded-md p-1"
                      onClick={() => setIsResizingActive(!isResizingActive)}
                    >
                      <ZoomIcon color="black" size={20} />
                    </button>
                  </TooltipTrigger>
                  {rotation === 0 && (
                    <TooltipContent>
                      <p>Resize</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}

              {tokenOfQuery && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="bg-neutral-100 rounded-md p-1"
                      onClick={handleOpenSignInModal}
                    >
                      <SignatureIcon color="black" size={20} />
                    </button>
                  </TooltipTrigger>
                  {rotation === 0 && (
                    <TooltipContent>
                      <p>Sign In</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          )}

          <div
            className={`border inline-flex gap-x-2 items-center justify-center cursor-pointer ${
              isFocus ? "border-dashed border-neutral-600" : ""
            }`}
            style={{
              backgroundColor: color,
              height: height,
              width: width,
              opacity: 0.7,
            }}
            onClick={() => setIsFocus(true)}
          >
            <div
              className={`border inline-flex gap-x-2 items-center justify-center cursor-pointer ${
                isFocus ? "border-dashed border-neutral-600" : ""
              }`}
              style={{
                backgroundColor: color,
                height: height,
                width: width,
                opacity: 0.7,
              }}
              onClick={() => setIsFocus(true)}
            >
              {sign?.signature?.type === "span" && (
                <span
                  style={sign.signature.props.style}
                  className={sign.signature.props.className || ""}
                >
                  {sign.signature.props.children}
                </span>
              )}
              {sign?.signature?.type === "img" && (
                <Image
                  src={sign.signature.props.src}
                  alt={sign.signature.props.alt || "Signature"}
                  style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
              {(!sign?.signature?.type ||
                (sign?.signature?.type !== "img" &&
                  sign?.signature?.type !== "span")) && (
                <>
                  <SignatureIcon color="black" />
                  <span className="text-xs font-semibold text-black">
                    {t("sign")}
                  </span>
                </>
              )}

              {isResizingActive && (
                <div
                  className="absolute right-[-6px] bottom-[-6px] w-3 h-3 bg-slate-500 cursor-se-resize rounded-full"
                  onMouseDown={handleResizeMouseDown}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {isEditingSignature && (
        <SignDocumentModal
          isOpen={isEditingSignature}
          onClose={() => setIsEditingSignature(false)}
        />
      )}
    </>
  );
}

export default SignItem;
