import { IconProps } from "@/types";

export const ColIcon = ({
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
            <rect y="0.857178" width="20" height="14.2857" rx="1.71429" fill="white" />
            <mask
                id="mask0_5914_2921"
                style={{ maskType: "luminance" } as any}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="20"
                height="16"
            >
                <rect y="0.857178" width="20" height="14.2857" rx="1.71429" fill="white" />
            </mask>
            <g mask="url(#mask0_5914_2921)">
                <g filter="url(#filter0_d_5914_2921)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 11.3333H20V7.5238H0V11.3333Z"
                        fill="#0748AE"
                    />
                </g>
                <g filter="url(#filter1_d_5914_2921)">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M0 15.1429H20V11.3334H0V15.1429Z"
                        fill="#DE2035"
                    />
                </g>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 7.52384H20V0.857178H0V7.52384Z"
                    fill="#FFD935"
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_5914_2921"
                    x="0"
                    y="7.5238"
                    width="20"
                    height="3.80957"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_5914_2921"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_5914_2921"
                        result="shape"
                    />
                </filter>
                <filter
                    id="filter1_d_5914_2921"
                    x="0"
                    y="11.3334"
                    width="20"
                    height="3.80957"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_5914_2921"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_5914_2921"
                        result="shape"
                    />
                </filter>
            </defs>
        </svg>
    );
};
