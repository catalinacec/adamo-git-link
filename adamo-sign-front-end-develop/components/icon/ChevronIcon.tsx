import { IconProps } from "@/types";

export const ChevronIcon = ({
  size = 24,
  color = "currentColor",
  className,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.9992 14.6998L6.69922 9.3998L7.39922 8.6748L11.9992 13.2748L16.5992 8.6748L17.2992 9.3998L11.9992 14.6998Z"
        fill={color}
      />
    </svg>
  );
};
