import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0B0B12",
          secondary: "#141428",
          tertiary: "#1B0F2E",
        },
        accent: {
          primary: "#7C4DFF",
          secondary: "#B388FF",
          tertiary: "#E040FB",
          cyan: "#00E5FF",
        },
        success: "#00E676",
        warning: "#FFAB40",
        danger: "#FF5252",
        text: {
          primary: "#FFFFFF",
          secondary: "#B0B0C0",
          muted: "#666680",
        },
        border: {
          glow: "rgba(124, 77, 255, 0.4)",
          subtle: "rgba(255, 255, 255, 0.05)",
        },
      },
      backgroundImage: {
        "premium-gradient": "linear-gradient(135deg, #7C4DFF 0%, #B388FF 50%, #E040FB 100%)",
        "radial-highlights": "radial-gradient(circle at 50% 50%, rgba(124, 77, 255, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "neon-glow": "0 0 20px rgba(124, 77, 255, 0.4)",
        "glass-shadow": "0 8px 32px 0 rgba(0, 0, 0, 0.8)",
      },
      borderRadius: {
        "px-16": "16px",
        "px-24": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
