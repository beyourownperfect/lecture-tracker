export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fafafa",
        foreground: "#111827",
        surface: "#ffffff",
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#2563eb",
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f3f4f6",
          foreground: "#111827",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        accent: {
          DEFAULT: "#f3f4f6",
          foreground: "#111827",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
        "text-primary": "#111827",
        "text-secondary": "#6b7280",
        "brand-accent": "#2563eb",
        "accent-light": "#dbeafe",
        success: "#16a34a",
        "success-light": "#dcfce7",
        "revision-notes": "#7c3aed",
        "revision-flashcards": "#ea580c",
      },
      fontFamily: {
        heading: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
