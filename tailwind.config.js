/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ef6a4d",
          hover: "#e85d42",
          soft: "#fff1ea",
        },
        reader: {
          shelf: "#f7f1e8",
          ink: "#2f2923",
          muted: "#8b7768",
          card: "#fffaf2",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(99, 61, 36, 0.12)",
        shelf: "0 12px 28px rgba(105, 72, 44, 0.10)",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "\"Noto Sans SC\"",
          "sans-serif",
        ],
        serif: ["Georgia", "\"Times New Roman\"", "\"Noto Serif SC\"", "\"Songti SC\"", "serif"],
        mono: ["\"SFMono-Regular\"", "Consolas", "\"Liberation Mono\"", "monospace"],
      },
    },
  },
  plugins: [],
};
