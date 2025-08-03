import { IconProps } from "@/types";

export const PeruIcon = ({
    size = 22,
    className,
}: IconProps) => {
    return (
        <svg
            width={size}
            height={typeof size === "number" ? (size * 16) / 20 : 16}
            viewBox="0 0 20 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <rect
                x="0.25"
                y="1.10718"
                width="19.5"
                height="13.7857"
                rx="1.46429"
                fill="white"
                stroke="#F5F5F5"
                strokeWidth="0.5"
            />
            <mask
                id="mask0"
                style={{ maskType: "luminance" } as any}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="20"
                height="16"
            >
                <rect
                    x="0.25"
                    y="1.10718"
                    width="19.5"
                    height="13.7857"
                    rx="1.46429"
                    fill="white"
                    stroke="white"
                    strokeWidth="0.5"
                />
            </mask>
            <g mask="url(#mask0)">
                <rect
                    x="13.3335"
                    y="0.857178"
                    width="6.66667"
                    height="14.2857"
                    fill="#E82438"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 15.1429H6.66667V0.857178H0V15.1429Z"
                    fill="#E82438"
                />
            </g>
        </svg>
    );
};
