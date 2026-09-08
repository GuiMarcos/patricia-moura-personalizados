import type { Config } from "tailwindcss";

/**
 * Identidade Patricia Moura Personalizados.
 * Rosa principal #C9787D · fundo creme #FFFCFA · texto cacau #5F5A58.
 * Sálvia = secundária · azul pastel + pêssego = pequenos detalhes.
 */
export const brandColors = {
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
  cocoa: {
    light: "#A39D9A",
    DEFAULT: "#5F5A58",
    dark: "#463F3D",
  },
  sage: {
    light: "#E7EBD8",
    DEFAULT: "#A8B38A",
    dark: "#7C8A5F",
  },
  pastel: {
    light: "#E4F1F6",
    DEFAULT: "#A9D1DF",
    dark: "#6FA9BE",
  },
  peach: {
    light: "#FBEAD6",
    DEFAULT: "#F3C69D",
    dark: "#CE9460",
  },
};

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: brandColors,
    },
  },
  plugins: [],
};

export default config;
