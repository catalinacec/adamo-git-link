import { IconProps } from "@/types";

export const FilterIcon = ({
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
      <mask
        id="mask0_36_7509"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_36_7509)">
        <path
          d="M11.5 20.5V15.5H12.5V17.5H20.5V18.5H12.5V20.5H11.5ZM3.5 18.5V17.5H8.5V18.5H3.5ZM7.5 14.5V12.5H3.5V11.5H7.5V9.5H8.5V14.5H7.5ZM11.5 12.5V11.5H20.5V12.5H11.5ZM15.5 8.5V3.5H16.5V5.5H20.5V6.5H16.5V8.5H15.5ZM3.5 6.5V5.5H12.5V6.5H3.5Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
