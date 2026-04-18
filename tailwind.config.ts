import type { Config } from "tailwindcss/plugin";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#003366",
          accent: "#FF8C00",
        },
      },
    },
  },
};

export default config;
