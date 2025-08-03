import { IconProps } from "@/types";

export const CloseIcon = ({ size = 24, color = "currentColor" }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.39922 18.3002L5.69922 17.6002L11.2992 12.0002L5.69922 6.4002L6.39922 5.7002L11.9992 11.3002L17.5992 5.7002L18.2992 6.4002L12.6992 12.0002L18.2992 17.6002L17.5992 18.3002L11.9992 12.7002L6.39922 18.3002Z"
        fill={color}
      />
    </svg>
  );
};
