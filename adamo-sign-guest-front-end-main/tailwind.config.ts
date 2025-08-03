import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

import { generateTailwindColors } from "./lib/generateTailwindColors";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--adamo-sign-600))",
        "adamo-sign": generateTailwindColors("adamo-sign"),
        "adamo-id": generateTailwindColors("adamo-id"),
        "adamo-pay": generateTailwindColors("adamo-pay"),
        "adamo-risk": generateTailwindColors("adamo-risk"),
        neutral: generateTailwindColors("neutral"),
        error: generateTailwindColors("error"),
        warning: generateTailwindColors("warning"),
        success: generateTailwindColors("success"),
        sidebar: {
          DEFAULT: "rgb(var(--sidebar-background))",
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', "sans-serif"],
      },
      fontSize: {
        lg: ["18px", "28px"],
        base: ["16px", "24px"],
        sm: ["14px", "20px"],
        xs: ["12px", "20px"],
        caption: ["11px", "18px"],
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "loading-bar": {
          "0%": { transform: "translateX(4px)" },
          "100%": { transform: "translateX(250%)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "loading-bar": "loading-bar 1.75s ease-in-out infinite alternate",
      },
      boxShadow: {
        DEFAULT: "0px 0px 56px 0px rgba(77, 87, 97, 0.08)",
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
