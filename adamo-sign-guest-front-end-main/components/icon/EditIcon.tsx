import { IconProps } from "@/types";

export const EditIcon = ({
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
      <path
        d="M5.30078 19H6.37578L16.2758 9.1L15.2008 8.025L5.30078 17.925V19ZM18.4258 8.375L15.9258 5.9L17.1258 4.7C17.3258 4.48333 17.5674 4.375 17.8508 4.375C18.1341 4.375 18.3758 4.48333 18.5758 4.7L19.6258 5.725C19.8258 5.925 19.9258 6.16667 19.9258 6.45C19.9258 6.73333 19.8258 6.975 19.6258 7.175L18.4258 8.375ZM17.7008 9.1L6.80078 20H4.30078V17.5L15.2008 6.6L17.7008 9.1ZM15.7258 8.55L15.2008 8.025L16.2758 9.1L15.7258 8.55Z"
        fill={color}
      />
    </svg>
  );
};
