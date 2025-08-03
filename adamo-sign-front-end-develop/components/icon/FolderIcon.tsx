import { IconProps } from "@/types";

export const FolderIcon = ({
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
        id="mask0_5972_13258"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
      >
        <rect width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_5972_13258)">
        <path
          d="M4.5 19C4.07817 19 3.72275 18.8554 3.43375 18.5663C3.14458 18.2773 3 17.9218 3 17.5V6.6155C3 6.19367 3.16375 5.81892 3.49125 5.49125C3.81892 5.16375 4.19367 5 4.6155 5H9.59625L11.5963 7H19.3845C19.7295 7 20.0305 7.09325 20.2875 7.27975C20.5445 7.46625 20.7243 7.70633 20.827 8H11.1943L9.19425 6H4.6155C4.436 6 4.2885 6.05767 4.173 6.173C4.05767 6.2885 4 6.436 4 6.6155V17.3845C4 17.5257 4.03525 17.6411 4.10575 17.7308C4.17625 17.8206 4.26917 17.8975 4.3845 17.9615L6.65 10.3845H22.8655L20.598 17.9405C20.5032 18.2583 20.3215 18.5144 20.053 18.7087C19.7843 18.9029 19.4846 19 19.1538 19H4.5ZM5.427 18H19.5385L21.5115 11.3845H7.4L5.427 18Z"
          fill={color}
        />
      </g>
    </svg>
  );
};
