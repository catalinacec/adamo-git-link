import { useOnClickOutside } from "usehooks-ts";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

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
  slideElement: HTMLElement | null;
  viewerRef: React.RefObject<HTMLElement>;
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
  signatureContentFixed: boolean;
  signatureIsEdit: boolean;
  slideElement: HTMLElement;
  color: string;
  width: number;
  height: number;
  rotation?: number;
  signatureDelete: boolean;
}

function AdminSignItem({
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
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [_resizing, setResizing] = useState(false);
  const [signInDocumentModal, setSignInDocumentModal] = useState(false);
  const { setActiveSignature, setTypedSignature, setActiveUserOfQuery } =
    useSignatureData();
  const ref = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("SignItem");

  useOnClickOutside(ref, () => setIsFocus(false));

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialWidth = size.width;
    const initialHeight = size.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - initialMouseX;
      const deltaY = moveEvent.clientY - initialMouseY;

      const newWidth = Math.max(initialWidth + deltaX, 50);
      const newHeight = Math.max(initialHeight + deltaY, 20);

      setSize({ width: newWidth, height: newHeight });

      setSignatures((prevSignatures) =>
        prevSignatures.map((signature) =>
          signature.id === id
            ? { ...signature, width: newWidth, height: newHeight }
            : signature,
        ),
      );
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const copySignature = () => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    if (!slides || slides.length === 0) {
      alert("No slides available to add a signature!");
      return;
    }

    if (!viewerRef.current) {
      alert("Viewer reference is not available.");
      return;
    }

    const signatureSlideIndex = currentSlideIndex;
    const currentSlide = slides[signatureSlideIndex] as HTMLElement;
    const slideWidth = currentSlide.offsetWidth;
    const slideHeight = currentSlide.offsetHeight;

    const containerScrollTop = viewerRef.current.scrollTop || 0;
    const containerScrollLeft = viewerRef.current.scrollLeft || 0;

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

        const signature: Signature = {
            id: crypto.randomUUID(),
            left: randomLeft / slideWidth,
            top: randomTop / slideHeight,
            slideIndex: signatureSlideIndex,
            signatureText: "Signature",
            signatureContentFixed: true,
            signatureIsEdit: false,
            slideElement: currentSlide,
            color: "green",
            width: 220,
            height: 80,
            rotation: 0,
            signatureDelete: false
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

      newLeft = Math.min(
        Math.max(newLeft, 0 + width / (2 * slideRect.width)),
        1 - width / (2 * slideRect.width),
      );
      newTop = Math.min(
        Math.max(newTop, 0 + height / (2 * slideRect.height)),
        1 - height / (2 * slideRect.height),
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

          let newLeft = signature.left;
          let newTop = signature.top;

          const halfWidth = size.width / (2 * slideRect.width);
          const halfHeight = size.height / (2 * slideRect.height);

          newLeft = Math.min(Math.max(newLeft, halfWidth), 1 - halfWidth);
          newTop = Math.min(Math.max(newTop, halfHeight), 1 - halfHeight);

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

    if (signatureRect.top - slideRect.top < 50) {
      setFocusPosition("top");
    } else {
      setFocusPosition("bottom");
    }
  };

  const signInDocument = () => {
    setSignInDocumentModal(true);
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
    if (isFocus) {
      handleFocusPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocus, top, left, slideElement]);

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
                <TooltipContent>
                  <p>Remove Signature</p>
                </TooltipContent>
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
                <TooltipContent>
                  <p>Rotate Signature</p>
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
                  <p>Zoom In</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="bg-neutral-100 rounded-md p-1"
                    onClick={() => setIsZoomedIn(!isZoomedIn)}
                    onMouseDown={handleResizeMouseDown}
                  >
                    <ZoomIcon color="black" size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isZoomedIn ? "Zoom Out" : "Zoom In"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signInDocument}
                    type="button"
                    className="bg-neutral-100 rounded-md p-1"
                  >
                    <SignatureIcon color="black" size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Signature</p>
                </TooltipContent>
              </Tooltip>
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
            <SignatureIcon color="black" />
            <span className="text-xs font-semibold text-black">
              {t("sign")}
            </span>
          </div>
        </div>
      </div>
      {signInDocumentModal && (
        <SignDocumentModal
          isOpen={signInDocumentModal}
          onClose={() => setSignInDocumentModal(false)}
        />
      )}
    </>
  );
}

export default AdminSignItem;
