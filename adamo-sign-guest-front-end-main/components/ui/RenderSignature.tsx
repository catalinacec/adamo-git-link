import { SignatureIcon } from "../icon/SignatureIcon";

interface Signature {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  signatureText: string;
  slideIndex: number;
}

interface RenderSignatureProps {
  viewerRef: React.RefObject<HTMLDivElement>;
  signatures: Signature[];
  activeUser: string;
}

export const RenderSignature: React.FC<RenderSignatureProps> = ({
  viewerRef,
  signatures,
}) => {
  return (
    <>
      {signatures.map((signature) => {
        const { left, top, width, height, color, signatureText, slideIndex } =
          signature;

        // Find the PDF slide element for the given slideIndex
        const slideElement = viewerRef.current?.querySelector(
          `.pdf-slide[data-slide-index='${slideIndex}']`,
        );

        // If the slide is not rendered yet, return null
        if (!slideElement) {
          return null;
        }

        // Calculate the absolute position of the signature relative to the slide
        const slideRect = slideElement.getBoundingClientRect();
        const leftPosition = slideRect.left + slideRect.width * left;
        const topPosition = slideRect.top + slideRect.height * top;
        const signatureWidth = slideRect.width * width;
        const signatureHeight = slideRect.height * height;

        return (
          <div
            key={signature.id}
            className="absolute inline-flex gap-x-2 items-center justify-center cursor-pointer"
            style={{
              left: `${leftPosition}px`,
              top: `${topPosition}px`,
              width: `${signatureWidth}px`,
              height: `${signatureHeight}px`,
              backgroundColor: color,
              opacity: 0.7,
              borderRadius: "4px",
              border: "1px solid #000",
            }}
          >
            <SignatureIcon color="black" />
            <span className="text-xs font-semibold text-black">
              {signatureText}
            </span>
          </div>
        );
      })}
    </>
  );
};
