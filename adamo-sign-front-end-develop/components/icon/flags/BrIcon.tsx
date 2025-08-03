import { IconProps } from "@/types";

export const BrIcon = ({
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
                id="mask0_5914_2905"
                style={{ maskType: "luminance" } as any}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="20"
                height="16"
            >
                <rect y="0.857178" width="20" height="14.2857" rx="1.71429" fill="white" />
            </mask>
            <g mask="url(#mask0_5914_2905)">
                <rect y="0.857178" width="20" height="14.2857" fill="#05AB41" />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M2.64617 8.47974C2.29818 8.25457 2.29818 7.74541 2.64617 7.52024L9.68954 2.96276C9.87845 2.84053 10.1215 2.84053 10.3104 2.96276L17.3538 7.52024C17.7018 7.74541 17.7018 8.25457 17.3538 8.47974L10.3104 13.0372C10.1215 13.1595 9.87845 13.1595 9.68954 13.0372L2.64617 8.47974Z"
                    fill="#FDD216"
                />
                <ellipse cx="9.99984" cy="7.99996" rx="3.33333" ry="3.33333" fill="#053087" />
                <mask
                    id="mask1_5914_2905"
                    style={{ maskType: "luminance" } as any}
                    maskUnits="userSpaceOnUse"
                    x="6"
                    y="4"
                    width="8"
                    height="8"
                >
                    <ellipse cx="9.99984" cy="7.99996" rx="3.33333" ry="3.33333" fill="white" />
                </mask>
                <g mask="url(#mask1_5914_2905)">
                    <path
                        d="M6.27154 7.12877C6.7949 6.70496 8.48373 7.10644 10.0602 7.52697C11.6367 7.94751 13.2809 8.82894 13.6995 9.34592"
                        stroke="white"
                        strokeWidth="1.14286"
                        strokeLinecap="square"
                    />
                </g>
            </g>
        </svg>
    );
};