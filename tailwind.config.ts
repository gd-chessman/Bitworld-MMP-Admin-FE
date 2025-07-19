import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.375rem)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        "0.5": "0.125rem", // 2px
        "1": "0.25rem", // 4px
        "1.5": "0.375rem", // 6px
        "2": "0.5rem", // 8px
        "2.5": "0.625rem", // 10px
        "3": "0.75rem", // 12px
        "3.5": "0.875rem", // 14px
        "4": "1rem", // 16px
        "5": "1.25rem", // 20px
        "6": "1.5rem", // 24px
        "7": "1.75rem", // 28px
        "8": "2rem", // 32px
        "9": "2.25rem", // 36px
        "10": "2.5rem", // 40px
        "11": "2.75rem", // 44px
        "12": "3rem", // 48px
        "14": "3.5rem", // 56px
        "16": "4rem", // 64px
        "20": "5rem", // 80px
        "24": "6rem", // 96px
        "28": "7rem", // 112px
        "32": "8rem", // 128px
        "36": "9rem", // 144px
        "40": "10rem", // 160px
        "44": "11rem", // 176px
        "48": "12rem", // 192px
        "52": "13rem", // 208px
        "56": "14rem", // 224px
        "60": "15rem", // 240px
        "64": "16rem", // 256px
        "72": "18rem", // 288px
        "80": "20rem", // 320px
        "96": "24rem", // 384px
      },
      fontSize: {
        xs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
        "6xl": "3.75rem", // 60px
        "7xl": "4.5rem", // 72px
        "8xl": "6rem", // 96px
        "9xl": "8rem", // 128px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
