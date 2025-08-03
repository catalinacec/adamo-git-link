import { IconProps } from "@/types";

export const ZoomIcon = ({
  size = 24,
  color = "currentColor",
  className,
}: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask
        id="mask0_1226_47070"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <rect width="20" height="20" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_1226_47070)">
        <path
          d="M3.8335 16.1667V13H4.50016V15.0144L7.35433 12.1602L7.83995 12.6458L4.98579 15.5H7.00016V16.1667H3.8335ZM12.646 7.8398L12.1604 7.35418L15.0145 4.50001H13.0002V3.83334H16.1668V7.00001H15.5002V4.98564L12.646 7.8398Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
