import { IconProps } from "@/types";

export const RestoreIcon = ({
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
        id="mask0_72_196"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_72_196)">
        <path
          d="M11.5 19V10.35L9.16925 12.6808L8.4615 11.9615L12 8.423L15.5385 11.9615L14.8307 12.6808L12.5 10.35V19H11.5ZM5 9.0385V6.6155C5 6.15517 5.15417 5.77083 5.4625 5.4625C5.77083 5.15417 6.15517 5 6.6155 5H17.3845C17.8448 5 18.2292 5.15417 18.5375 5.4625C18.8458 5.77083 19 6.15517 19 6.6155V9.0385H18V6.6155C18 6.4615 17.9359 6.32042 17.8077 6.19225C17.6796 6.06408 17.5385 6 17.3845 6H6.6155C6.4615 6 6.32042 6.06408 6.19225 6.19225C6.06408 6.32042 6 6.4615 6 6.6155V9.0385H5Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
