import { IconProps } from "@/types";

export const CheckIcon = ({
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
        id="mask0_36_7502"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill={color} />
      </mask>
      <g mask="url(#mask0_36_7502)">
        <path
          d="M9.5493 17.3078L4.58008 12.3385L5.29353 11.6251L9.5493 15.8809L18.7051 6.7251L19.4185 7.43855L9.5493 17.3078Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
