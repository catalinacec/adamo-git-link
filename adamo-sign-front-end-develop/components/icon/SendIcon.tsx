import { IconProps } from "@/types";

export const SendIcon = ({
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
        id="mask0_36_7508"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_36_7508)">
        <path
          d="M4 18.5V5.5L19.423 12L4 18.5ZM5 17L16.85 12L5 7V10.8845L9.84625 12L5 13.1155V17Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
