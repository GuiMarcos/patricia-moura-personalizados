import type { Config } from "tailwindcss";

/** Mesma identidade do storefront: rosa #C9787D sobre fundo creme. */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FDF0F1",
          100: "#F9E1E4",
          200: "#F6D9DC",
          300: "#EFB7BD",
          400: "#DD94A0",
          500: "#C9787D",
          600: "#B9656B",
          700: "#9E545A",
          800: "#7C454B",
          900: "#5D363B",
        },
        cream: "#FFFCFA",
      },
    },
  },
  plugins: [],
};

export default config;
