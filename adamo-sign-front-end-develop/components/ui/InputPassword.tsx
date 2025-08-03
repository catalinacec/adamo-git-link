"use client";

import { useState } from "react";
import { InputProps } from "@/types";

import { HideIcon, SeeIcon } from "@/components/icon";
import { Input } from "@/components/ui/Input";

interface InputPasswordProps extends React.ComponentProps<"input">, InputProps {
  // eslint-disable-next-line
  field?: any;
  variant?: "light" | "dark" | "error";
}

export const InputPassword = ({
  field,
  variant,
  className,
  helperText,
  ...rest
}: InputPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Input
      type={showPassword ? "text" : "password"}
      variant={variant}
      {...field}
      {...rest}
      className={className}
      iconRight={
        <button
          type="button"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <HideIcon /> : <SeeIcon />}
        </button>
      }
      helperText={helperText}
    />
  );
};
