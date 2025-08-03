import { IconProps } from "@/types";

export const PlusIcon = ({
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
        d="M11.5 18.5V12.5H5.5V11.5H11.5V5.5H12.5V11.5H18.5V12.5H12.5V18.5H11.5Z"
        fill={color}
      />
    </svg>
  );
};
