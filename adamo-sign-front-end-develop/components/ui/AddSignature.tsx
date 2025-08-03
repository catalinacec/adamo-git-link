import { Signature } from "@/types";
import { forwardRef, useImperativeHandle } from "react";
import { useSignatureData } from "@/context/SignatureContext";

const AddSignature = forwardRef((props, ref) => {
  const { viewerRef, setSignatures, currentSlideIndex } = useSignatureData();

  const addSignature = ({
    activeRecipient,
  }: {
    activeRecipient: {
      email: string;
      firstName: string;
      lastName: string;
      color: string;
    };
  }) => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );

    if (slides.length === 0) {
      alert("No slides available to add a signature!");
      return;
    }

    const selectedRecipientEmail = activeRecipient?.email || null;
    const selectedRecipientFirstName = activeRecipient?.firstName || null;
    const selectedRecipientLastName = activeRecipient?.lastName || null;
    const recipientColor = activeRecipient?.color;

    const currentSlide = slides[currentSlideIndex];
    const slideWidth = currentSlide.offsetWidth;
    const slideHeight = currentSlide.offsetHeight;

    const slideTopInContainer = currentSlide.offsetTop;
    const slideLeftInContainer = currentSlide.offsetLeft;

    const visibleSlideTop = Math.max(
      currentSlide.offsetTop,
      viewerRef.current.scrollTop,
    );
    const visibleSlideLeft = Math.max(
      currentSlide.offsetLeft,
      viewerRef.current.scrollLeft,
    );
    const visibleSlideBottom = Math.min(
      currentSlide.offsetTop + currentSlide.offsetHeight,
      viewerRef.current.scrollTop + viewerRef.current.offsetHeight,
    );
    const visibleSlideRight = Math.min(
      currentSlide.offsetLeft + currentSlide.offsetWidth,
      viewerRef.current.scrollLeft + viewerRef.current.offsetWidth,
    );

    const visibleWidth = Math.max(0, visibleSlideRight - visibleSlideLeft);
    const visibleHeight = Math.max(0, visibleSlideBottom - visibleSlideTop);

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
      slideIndex: currentSlideIndex,
      signatureText: "Signature",
      recipientsName: `${selectedRecipientFirstName} ${selectedRecipientLastName}`,
      recipientEmail: String(selectedRecipientEmail),
      signatureContentFixed: true,
      signatureIsEdit: false,
      slideElement: currentSlide,
      color: recipientColor,
      width: 220,
      height: 80,
      rotation: 0,
      signatureDelete: false,
    };

    setSignatures((prevSignatures: Signature[]) => [
      ...prevSignatures,
      { ...signature, slideElement: signature.slideElement as HTMLElement },
    ]);
  };

  const addAdminSignature = () => {
    const slides = viewerRef.current?.querySelectorAll(
      ".pdf-slide, .image-slide",
    );
    if (slides.length === 0) {
      alert("No slides available to add a signature!");
      return;
    }

    const currentSlide = slides[currentSlideIndex];
    const slideWidth = currentSlide.offsetWidth;
    const slideHeight = currentSlide.offsetHeight;

    const slideTopInContainer = currentSlide.offsetTop;
    const slideLeftInContainer = currentSlide.offsetLeft;

    const visibleSlideTop = Math.max(
      currentSlide.offsetTop,
      viewerRef.current.scrollTop,
    );
    const visibleSlideLeft = Math.max(
      currentSlide.offsetLeft,
      viewerRef.current.scrollLeft,
    );
    const visibleSlideBottom = Math.min(
      currentSlide.offsetTop + currentSlide.offsetHeight,
      viewerRef.current.scrollTop + viewerRef.current.offsetHeight,
    );
    const visibleSlideRight = Math.min(
      currentSlide.offsetLeft + currentSlide.offsetWidth,
      viewerRef.current.scrollLeft + viewerRef.current.offsetWidth,
    );

    const visibleWidth = Math.max(0, visibleSlideRight - visibleSlideLeft);
    const visibleHeight = Math.max(0, visibleSlideBottom - visibleSlideTop);

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
      slideIndex: currentSlideIndex,
      signatureText: "Signature",
      signatureContentFixed: true,
      signatureIsEdit: false,
      slideElement: currentSlide,
      color: "green",
      width: 220,
      height: 80,
      rotation: 0,
      signatureDelete: false,
      recipientsName: "",
      recipientEmail: "",
    };

    setSignatures((prevSignatures) => [...prevSignatures, signature]);
  };

  useImperativeHandle(ref, () => ({
    addSignature,
    addAdminSignature,
  }));

  // No renderizado de SignItem aquí
  return null;
});

AddSignature.displayName = "AddSignature";
export default AddSignature;
