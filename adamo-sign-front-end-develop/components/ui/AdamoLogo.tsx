import Image from "next/image";
import { cn } from "@/lib/utils";

interface AdamoLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const AdamoLogo = (props: AdamoLogoProps) => {
  const { className, width = 220, height = 126 } = props;

  return (
    <Image
      src="/adamo-logo.svg"
      alt="AdamoSign Company logo"
      width={width}
      height={height}
      role="img"
      priority
      className={cn(className)}
    />
  );
};

const AdamoPencilLogo = (props: AdamoLogoProps) => {
  const { className, width = 86, height = 64 } = props;

  return (
    <Image
      src="/adamo-pencil-logo.svg"
      alt="AdamoSign Company logo"
      width={width}
      height={height}
      role="img"
      priority
      className={cn(className)}
    />
  );
};

export { AdamoLogo, AdamoPencilLogo };
