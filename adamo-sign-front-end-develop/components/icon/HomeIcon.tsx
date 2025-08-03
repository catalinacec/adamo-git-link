import { IconProps } from "@/types";

export const HomeIcon = ({ size = 24, color = "currentColor" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 19.0002H9.7V13.1252H14.3V19.0002H18V10.0002L12 5.4502L6 10.0002V19.0002ZM5 20.0002V9.5002L12 4.2002L19 9.5002V20.0002H13.3V14.1252H10.7V20.0002H5Z"
        fill={color}
      />
    </svg>
  );
};
