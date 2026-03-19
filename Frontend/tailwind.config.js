/** @type {import('tailwindcss').Config} */
const defaultConfig = require("tailwindcss/defaultConfig")

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    ...defaultConfig.theme,
    extend: {
      colors: {
        // Rwanda flag colors
        "rwanda-blue": "#00A1DE",
        "rwanda-yellow": "#FAD201",
        "rwanda-green": "#00A651",
        // NESA/REB colors
        "nesa-blue": "#1E40AF",
        "nesa-green": "#059669",
        // Modern slate palette
        slate: {
          50: "rgb(var(--slate-50))",
          100: "rgb(var(--slate-100))",
          200: "rgb(var(--slate-200))",
          300: "rgb(var(--slate-300))",
          400: "rgb(var(--slate-400))",
          500: "rgb(var(--slate-500))",
          600: "rgb(var(--slate-600))",
          700: "rgb(var(--slate-700))",
          800: "rgb(var(--slate-800))",
          900: "rgb(var(--slate-900))",
        },
        // Status colors
        success: "rgb(var(--success))",
        warning: "rgb(var(--warning))",
        danger: "rgb(var(--danger))",
        info: "rgb(var(--info))",
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
