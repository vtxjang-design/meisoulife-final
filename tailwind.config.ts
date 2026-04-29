import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        navy: "#0f1f35",
        gold: "#d8bf83",
        moss: "#4f7a65",
        mist: "#eff3f4",
        sand: "#f6f2e9"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(7, 17, 31, 0.16)"
      },
      backgroundImage: {
        "hero-orb":
          "radial-gradient(circle at top, rgba(216, 191, 131, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(79, 122, 101, 0.28), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
