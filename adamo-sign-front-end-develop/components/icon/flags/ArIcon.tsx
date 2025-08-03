import { IconProps } from "@/types";

export const ArIcon = ({
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
                id="mask0_5914_2892"
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
            <g mask="url(#mask0_5914_2892)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 5.61908H20V0.857178H0V5.61908Z"
                    fill="#88BBE8"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 15.1429H20V10.381H0V15.1429Z"
                    fill="#88BBE8"
                />
                <circle
                    cx="9.99986"
                    cy="7.99998"
                    r="1.71429"
                    fill="#F4B32E"
                    stroke="#DB7A2C"
                    strokeWidth="0.571429"
                />
            </g>
        </svg>
    );
};
